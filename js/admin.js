document.addEventListener('DOMContentLoaded', () => {
  const manageVotesBtn = document.getElementById('manage-votes-btn');
  const addResultsBtn = document.getElementById('add-results-btn');
  const voteSection = document.getElementById('vote-management');
  const addResultSection = document.getElementById('add-result-section');
  const form = document.getElementById('result-form');
  const resultMsg = document.getElementById('result-msg');
  const yearSelect = document.getElementById("year-select");
  const resultsContainer = document.getElementById("results");
  const isOpenStatus = document.getElementById("is-open-status");
  const toggleButton = document.getElementById("toggle-open");
  const message = document.getElementById("message");
  const betsList = document.getElementById("bets-list");
  const betsContainer = document.getElementById("bets-results");

  if (!manageVotesBtn || !addResultsBtn || !voteSection || !addResultSection || !form || !resultMsg) {
    console.error('Uno o más elementos no se encontraron en el DOM.');
    return;
  }

  manageVotesBtn.addEventListener('click', () => {
    voteSection.classList.remove('hidden');
    addResultSection.classList.add('hidden');
  });

  addResultsBtn.addEventListener('click', () => {
    addResultSection.classList.remove('hidden');
    voteSection.classList.add('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const year = document.getElementById('year').value;
    const winner = document.getElementById('winner').value.trim();
    const lastPlace = document.getElementById('lastPlace').value.trim();
    const spain = parseInt(document.getElementById('spain').value);
    const halfTable = parseInt(document.getElementById('halfTable').value);
    const top10 = document.getElementById('top10').value
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`${SERVER_URL}/result/${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ winner, lastPlace, spain, halfTable, top10 })
      });

      if (response.ok) {
        resultMsg.textContent = '¡Resultados añadidos correctamente!';
        resultMsg.classList.remove('hidden', 'text-red-400');
        resultMsg.classList.add('text-green-400');
      } else {
        resultMsg.textContent = 'Error al añadir resultados';
        resultMsg.classList.remove('hidden', 'text-green-400');
        resultMsg.classList.add('text-red-400');
      }
    } catch (error) {
      resultMsg.textContent = 'Error de conexión con el servidor: '+error.message;
      resultMsg.classList.remove('hidden', 'text-green-400');
      resultMsg.classList.add('text-red-400');
    }
  });
  
    let pollsData = {};
    let messageTimeout;
  
    function clearMessage() {
      message.textContent = "";
      message.className = "";
      if (messageTimeout) clearTimeout(messageTimeout);
    }
  
    function displayPollData(year) {
      const poll = pollsData[year];
  
      resultsContainer.innerHTML = "";
      betsList.innerHTML = "";
  
      if (!poll) {
        isOpenStatus.textContent = "❌ No disponible";
        isOpenStatus.className = "text-yellow-400 font-bold";
        toggleButton.textContent = "No disponible";
        toggleButton.disabled = true;
        toggleButton.classList.add("hidden");
        betsContainer.classList.add("hidden");
        return;
      }
  
      // Estado de votación
      isOpenStatus.textContent = poll.isOpen ? "✅ Abierta" : "❌ Cerrada";
      isOpenStatus.className = poll.isOpen
        ? "text-green-400 font-bold"
        : "text-red-400 font-bold";
      toggleButton.textContent = poll.isOpen ? "Cerrar votación" : "Abrir votación";
      toggleButton.dataset.open = poll.isOpen;
      toggleButton.disabled = false;
      toggleButton.classList.remove("hidden");
  
      // Apuestas
      const sortedBets = Object.entries(poll.bets).sort(
        (a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp)
      );

    //   const betsEntries = Object.entries(poll.bets || {});
    //   if (betsEntries.length === 0) {
    //     betsContainer.classList.add("hidden");
    //     return;
    //   }
  
      betsContainer.classList.remove("hidden");
  
      sortedBets.forEach(([name, bet]) => {
        const div = document.createElement("div");
        div.className = "relative bg-white/10 border border-white/20 rounded p-4";

        div.innerHTML = `
          <button class="absolute top-2 right-2 text-sm text-red-400 hover:text-red-600 font-bold delete-bet" title="Eliminar apuesta">✖</button>
          <p class="text-center font-bold mb-2">${name}</p>
          <div class="text-left space-y-1">
            <p>Ganador: ${bet.winner}</p>
            <p>Último: ${bet.lastPlace}</p>
            <p>España: ${bet.spain}</p>
            <p>Mitad tabla: ${bet.halfTable === 1 ? "Primera" : "Segunda"}</p>
            <p>Favorito: ${bet.favourite}</p>
          </div>
          <p class="text-xs text-right text-gray-300 mt-2">${new Date(bet.timestamp).toLocaleString()}</p>
        `;

        div.dataset.name = name;
        betsList.appendChild(div);

        div.querySelector('.delete-bet').addEventListener('click', async () => {
          const confirmed = confirm(`¿Estás seguro de que deseas borrar la apuesta de "${name}" del año ${yearSelect.value}?`);
          if (!confirmed) return;

          try {
            const res = await fetch(`${SERVER_URL}/bet/${yearSelect.value}/${encodeURIComponent(name)}`, {
              method: 'DELETE'
            });

            if (res.ok) {
              div.remove();
            } else {
              const errText = await res.text();
              showModal(`❌ Error al borrar la apuesta: ${errText || res.status}`);
            }
          } catch (err) {
            showModal(`❌ Error de conexión: ${err.message}`);
          }
        });
});


    }
  
    function fetchAllPollsAndDisplay(year) {
      fetch(`${SERVER_URL}/polls`)
        .then((res) => res.json())
        .then((data) => {
          pollsData = data.polls || {};
          displayPollData(year);
        });
    }
  
    function updatePollStatus(year) {
      const poll = pollsData[year];
      if (!poll) return;
  
      isOpenStatus.textContent = poll.isOpen ? "✅ Abierta" : "❌ Cerrada";
      isOpenStatus.className = poll.isOpen
        ? "text-green-400 font-bold"
        : "text-red-400 font-bold";
      toggleButton.textContent = poll.isOpen ? "Cerrar votación" : "Abrir votación";
      toggleButton.dataset.open = poll.isOpen;
    }
  
    yearSelect.addEventListener("change", () => {
      const year = yearSelect.value;
      clearMessage();
      if (year) {
        fetchAllPollsAndDisplay(year);
      } else {
        toggleButton.classList.add("hidden");
        isOpenStatus.textContent = "";
        resultsContainer.innerHTML = "";
        betsList.innerHTML = "";
        betsContainer.classList.add("hidden");
      }
    });
  
    toggleButton.addEventListener("click", () => {
      const year = yearSelect.value;
      if (!year) return;
  
      const newState = toggleButton.dataset.open === "true" ? false : true;
  
      fetch(`${SERVER_URL}/poll/${year}/is-open`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: newState }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          message.textContent = "✅ Operación realizada con éxito";
          message.className = "text-green-400 mt-4";
          if (messageTimeout) clearTimeout(messageTimeout);
          messageTimeout = setTimeout(clearMessage, 4000);
          // Refrescar datos tras cambio de estado
          fetchAllPollsAndDisplay(year);
        })
        .catch(() => {
          message.textContent = "❌ Error al cambiar el estado de la votación";
          message.className = "text-red-400 mt-4";
          if (messageTimeout) clearTimeout(messageTimeout);
          messageTimeout = setTimeout(clearMessage, 4000);
        });
    });
});
