document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById("year-select");
  const resultsContainer = document.getElementById("results-container");
  const logo = document.getElementById("logo");

  // Logo clicado
  if (logo) {
    logo.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Petición a la API para obtener los resultados
  fetch("http://localhost:8080/polls")
    .then((res) => res.json())
    .then((data) => {
      // Verificar si los datos están en el formato correcto
      if (data && data.polls) {
        const polls = data.polls;  // Asigna correctamente a `polls`
        const years = Object.keys(polls).sort().reverse();  // Asegúrate de ordenar los años

        // Rellenar el select con los años disponibles
        yearSelect.innerHTML = "<option value='' disabled selected>Selecciona un año</option>";
        years.forEach((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });

        // Cargar el año guardado desde localStorage
        const savedYear = localStorage.getItem("selectedYear");
        if (savedYear && polls[savedYear]) {
          yearSelect.value = savedYear;  // Restablecer la selección del año
          showResults(savedYear, polls[savedYear]);
        }

        // Cuando el usuario selecciona un año
        yearSelect.addEventListener("change", () => {
          const year = yearSelect.value;
          localStorage.setItem("selectedYear", year);  // Guardar el año seleccionado
          showResults(year, polls[year]);
        });

      } else {
        throw new Error("Los datos de la API no tienen el formato esperado.");
      }
    })
    .catch((err) => {
      console.error("Error al cargar resultados:", err);
      resultsContainer.innerHTML = "<p class='text-red-400'>Error al cargar los resultados. Inténtalo más tarde.</p>";
    });

  // Función para mostrar los resultados
  function showResults(year, pollData) {
    resultsContainer.innerHTML = `<h2 class='text-2xl font-semibold mb-4'>Apuestas del año ${year}</h2>`;

    const bets = pollData.bets;
    if (!bets || Object.keys(bets).length === 0) {
      resultsContainer.innerHTML += "<p>No hay apuestas para este año.</p>";
      return;
    }

    // Mostrar las apuestas
    for (const [name, bet] of Object.entries(bets)) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h2>${name}</h2>
        <p><strong>Ganador:</strong> ${bet.winner}</p>
        <p><strong>Último lugar:</strong> ${bet.lastPlace}</p>
        <p><strong>Posición de España:</strong> ${bet.spain}</p>
        <p><strong>Mitad de la tabla:</strong> ${bet.halfTable === 1 ? "Primera" : "Segunda"}</p>
        <p><strong>País favorito:</strong> ${bet.favourite}</p>
        <p class='text-sm opacity-70'>Enviado el: ${new Date(bet.timestamp).toLocaleString()}</p>
      `;
      resultsContainer.appendChild(card);
    }
  }
});
