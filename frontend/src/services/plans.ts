import type { Pool } from "pg";

export type PlanCode = "gratis" | "premium";

export type Plan = {
  code: PlanCode;
  name: string;
  maxPets: number;
  maxCompare: number;
  priceMonthly: number;
};

export type UserPlan = Plan & {
  /** "active" se renueva; "canceled" mantiene el acceso hasta endsAt. null en el plan Gratis. */
  status: "active" | "canceled" | null;
  endsAt: string | null;
};

export type Payment = {
  id: number;
  amount: number;
  method: string;
  reference: string;
  paidAt: string;
};

/** Duración de un periodo pagado. */
export const BILLING_DAYS = 30;

type PlanRow = {
  code: PlanCode;
  name: string;
  max_pets: number;
  max_compare: number;
  price_monthly: number;
};

function toPlan(row: PlanRow): Plan {
  return {
    code: row.code,
    name: row.name,
    maxPets: row.max_pets,
    maxCompare: row.max_compare,
    priceMonthly: row.price_monthly,
  };
}

export async function getPlans(pool: Pool): Promise<Plan[]> {
  const result = await pool.query<PlanRow>(
    `SELECT code, name, max_pets, max_compare, price_monthly FROM plans WHERE active ORDER BY price_monthly`
  );
  return result.rows.map(toPlan);
}

async function getPlanByCode(pool: Pool, code: PlanCode): Promise<Plan> {
  const result = await pool.query<PlanRow>(
    `SELECT code, name, max_pets, max_compare, price_monthly FROM plans WHERE code = $1`,
    [code]
  );
  if (!result.rows[0]) throw new Error(`Falta el plan "${code}" en la tabla plans.`);
  return toPlan(result.rows[0]);
}

/**
 * Plan vigente del usuario. Sin suscripción vigente es Gratis. Las
 * suscripciones vencidas se marcan "expired" al consultarlas: no hace
 * falta una tarea programada para eso.
 */
export async function getUserPlan(pool: Pool, userId: number): Promise<UserPlan> {
  await pool.query(
    `
      UPDATE subscriptions SET status = 'expired'
      WHERE user_id = $1 AND status IN ('active', 'canceled') AND ends_at <= NOW()
    `,
    [userId]
  );

  const result = await pool.query<PlanRow & { status: "active" | "canceled"; ends_at: Date | null }>(
    `
      SELECT p.code, p.name, p.max_pets, p.max_compare, p.price_monthly, s.status, s.ends_at
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = $1 AND s.status IN ('active', 'canceled')
      LIMIT 1
    `,
    [userId]
  );

  const row = result.rows[0];
  if (!row) return { ...(await getPlanByCode(pool, "gratis")), status: null, endsAt: null };

  return {
    ...toPlan(row),
    status: row.status,
    endsAt: row.ends_at ? row.ends_at.toISOString() : null,
  };
}

export function isPremium(plan: Pick<UserPlan, "code">): boolean {
  return plan.code === "premium";
}

export class SubscriptionError extends Error {}

/**
 * Pasa al usuario a Premium con un pago simulado: no hay pasarela ni
 * cobro real. Registra la suscripción por BILLING_DAYS días y su pago,
 * para que el flujo quede listo para conectar una pasarela después.
 */
export async function subscribeToPremium(pool: Pool, userId: number): Promise<UserPlan> {
  const premium = await getPlanByCode(pool, "premium");
  // Marca como vencidas las que ya terminaron, para que no bloqueen la nueva.
  await getUserPlan(pool, userId);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const current = await client.query(
      `SELECT id, status FROM subscriptions WHERE user_id = $1 AND status IN ('active', 'canceled') AND ends_at > NOW() FOR UPDATE`,
      [userId]
    );

    let subscriptionId: string;
    if (current.rows[0]?.status === "active") {
      throw new SubscriptionError("Ya tienes el plan Premium activo.");
    } else if (current.rows[0]?.status === "canceled") {
      // Reactivar antes de que termine el periodo: no se cobra de nuevo.
      await client.query(`UPDATE subscriptions SET status = 'active' WHERE id = $1`, [current.rows[0].id]);
      await client.query("COMMIT");
      return getUserPlan(pool, userId);
    } else {
      const inserted = await client.query<{ id: string }>(
        `
          INSERT INTO subscriptions (user_id, plan_id, status, starts_at, ends_at)
          SELECT $1, id, 'active', NOW(), NOW() + make_interval(days => $2) FROM plans WHERE code = 'premium'
          RETURNING id
        `,
        [userId, BILLING_DAYS]
      );
      subscriptionId = inserted.rows[0].id;
    }

    const reference = `SIM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await client.query(
      `INSERT INTO subscription_payments (subscription_id, amount, method, reference) VALUES ($1, $2, 'simulado', $3)`,
      [subscriptionId, premium.priceMonthly, reference]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getUserPlan(pool, userId);
}

/** Cancela la renovación: el usuario sigue en Premium hasta el fin del periodo pagado. */
export async function cancelSubscription(pool: Pool, userId: number): Promise<UserPlan> {
  const result = await pool.query(
    `UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active' AND ends_at > NOW()`,
    [userId]
  );
  if (!result.rowCount) throw new SubscriptionError("No tienes una suscripción Premium activa.");
  return getUserPlan(pool, userId);
}

export async function getPayments(pool: Pool, userId: number): Promise<Payment[]> {
  const result = await pool.query<{ id: string; amount: number; method: string; reference: string; paid_at: Date }>(
    `
      SELECT sp.id, sp.amount, sp.method, sp.reference, sp.paid_at
      FROM subscription_payments sp
      JOIN subscriptions s ON s.id = sp.subscription_id
      WHERE s.user_id = $1
      ORDER BY sp.paid_at DESC
    `,
    [userId]
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    amount: row.amount,
    method: row.method,
    reference: row.reference,
    paidAt: row.paid_at.toISOString(),
  }));
}
