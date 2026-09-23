"use client";
import {useState} from "react";
import FoodResultCard from "@/components/compare/FoodResultCard";
import { MOCK_FOODS } from "@/services/mockFoods";
import styles from "./Comparar.module.css";

// MOCK: mascotas de ejemplo. Reemplazar por las mascotas reales del usuario
// (ver /mascotas) cuando exista backend.
const pets = [
  { 
    id: "max",
    name: "Max",
    species: "Perro",
    icon: "🐶",
  },
  { 
    id: "luna",
    name: "Luna",
    species: "Gato",
    icon: "🐱",
  },
];

export default function CompararPage() {
  const [selectedPetId, setSelectedPetId] = useState("max");

  const selectedPet = pets.find((pet) => pet.id === selectedPetId
  );
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section>
          <h1>Comparar Alimentos</h1>

          <p>Encuentra el alimentos compatibles con las características de {selectedPet?.name}</p>

          <div>
            <label htmlFor="pet">Mascota </label>

            <select value={selectedPetId} 
            onChange={(e) => setSelectedPetId(e.target.value)}
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.icon} {pet.name}
                </option>
              ))}
            </select>
          </div>
        </section>
        
        <section>
          <h2>Alimentos recomendados para {selectedPet?.name}</h2>

          <p>Ordenados según porcentaje de compatibilidad</p>
        </section>

        {MOCK_FOODS.map((food) => (
          <FoodResultCard
            key={food.id}
            name={food.name}
            brand={food.brand}
            compatibility={(food.compatibility)}
            price={food.price}
            protein={food.protein}
            fat={food.fat}
            hasColorants={food.hasColorants}
          />
        ))}
      </div>
    </main>
  );
}