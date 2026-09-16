"use client";
import {useState} from "react"; 
import FoodResultCard from "@/components/compare/FoodResultCard";
import styles from "./Comparar.module.css";
const foods = [
  {
    id: 1,
    name: "Royal Canin Adult",
    brand: "Royal Canin",
    compatibility: 92,
    price: 48990,
    protein: 26,
    fat: 15,
    hasColorants: true,
  },
  {
    id: 2,
    name: "Pro Plan Adult",
    brand: "Purina",
    compatibility: 88,
    price: 44990,
    protein: 27,
    fat: 14,
    hasColorants: false,
  },
  {
    id: 3,
    name: "Brit Care Adult",
    brand: "Brit Care",
    compatibility: 84,
    price: 39990,
    protein: 25,
    fat: 13,
    hasColorants: false,
  },
];

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

        {foods.map((food) => (
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