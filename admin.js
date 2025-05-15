document.addEventListener("DOMContentLoaded", () => {
    const yearSelect = document.getElementById("year-select");
    const resultsContainer = document.getElementById("results");
    const isOpenStatus = document.getElementById("is-open-status");
    const toggleButton = document.getElementById("toggle-open");
    const message = document.getElementById("message");
    const betsList = document.getElementById("bets-list");
    const betsContainer = document.getElementById("bets-results");
  
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
    //   betsEntries.forEach(([name, bet]) => {
        const div = document.createElement("div");
        div.className = "bg-white/10 border border-white/20 rounded p-4";
        div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <p><strong>${name}</strong></p>
            <p class="text-xs text-gray-300">${new Date(bet.timestamp).toLocaleString()}</p>
        </div>
        <p>Ganador: ${bet.winner}</p>
        <p>Último: ${bet.lastPlace}</p>
        <p>España: ${bet.spain}</p>
        <p>Mitad tabla: ${bet.halfTable === 1 ? "Primera" : "Segunda"}</p>
        <p>Favorito: ${bet.favourite}</p>
        `;
        // Elimina esta línea si no necesitas mostrar en dos sitios:
        // resultsContainer.appendChild(div);
        betsList.appendChild(div);
      });
    }
  
    function fetchAllPollsAndDisplay(year) {
      fetch(`http://192.168.1.46:8080/polls`)
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
  
      fetch(`http://192.168.1.46:8080/poll/${year}/is-open`, {
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
  