document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("your-results-form");
  const nameInput = document.getElementById("name-input");
  const resultContainer = document.getElementById("your-results-container");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    if (!name) return;

    const currentYear = new Date().getFullYear();
    const url = `https://euroviapp-production.up.railway.app/bet?year=${currentYear}&name=${encodeURIComponent(name)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("No se encontró la apuesta.");
      }

      const data = await response.json();

      // Aquí extraemos directamente los datos de la apuesta usando el año como clave
      const bet = data[currentYear];

      if (!bet) {
        resultContainer.innerHTML = `<p class="text-red-400">No se encontraron resultados para ${name} en ${currentYear}.</p>`;
        return;
      }

      resultContainer.innerHTML = `
        <div class="bg-card text-white shadow-lg p-4 rounded-lg mb-4">
          <h2 class="text-xl font-bold mb-2">Resultados de ${name} (${currentYear})</h2>
          <ul class="list-disc pl-5">
            <li><strong>Ganador:</strong> ${bet.winner}</li>
            <li><strong>Último lugar:</strong> ${bet.lastPlace}</li>
            <li><strong>Puesto de España:</strong> ${bet.spain}</li>
            <li><strong>Mitad del show:</strong> ${bet.halfTable === 1 ? "Primera mitad" : "Segunda mitad"}</li>
            <li><strong>Favorito personal:</strong> ${bet.favourite}</li>
            <li><strong>Fecha de apuesta:</strong> ${new Date(bet.timestamp).toLocaleString("es-ES")}</li>
          </ul>
        </div>
      `;
    } catch (err) {
      resultContainer.innerHTML = `<p class="text-red-400">Error al cargar los resultados: ${err.message}</p>`;
    }
  });
});
