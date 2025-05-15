const yearSelect = document.getElementById('year-select');
    const checkWinnerBtn = document.getElementById('check-winner');
    const errorMessage = document.getElementById('error-message');
    const mainContent = document.getElementById('main-content');
    const winnerSection = document.getElementById('winner-section');
    const countdown = document.getElementById('countdown');
    const winnerCard = document.getElementById('winner-card');
    const winnerName = document.getElementById('winner-name');
    const winnerScore = document.getElementById('winner-score');

    let selectedYear = "";
    let winnerData = null;

    // Poblar el selector con los años disponibles
    fetch("http://192.168.1.46:8080/polls")
      .then(res => res.json())
      .then(data => {
        const years = Object.keys(data.polls).sort().reverse();
        years.forEach(year => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      });

    // Verificar estado y obtener ganador
    checkWinnerBtn.addEventListener("click", () => {
      errorMessage.classList.add("hidden");
      selectedYear = yearSelect.value;
      if (!selectedYear) return;

      fetch("http://192.168.1.46:8080/polls")
        .then(res => res.json())
        .then(data => {
          const isOpen = data.polls[selectedYear]?.isOpen;
          if (isOpen) {
            errorMessage.textContent = "La porra tiene que estar cerrada para calcular el ganador.";
            errorMessage.classList.remove("hidden");
          } else {
            fetch(`http://192.168.1.46:8080/winner/${selectedYear}`)
              .then(res => res.json())
              .then(winner => {
                winnerData = winner;
                showCountdown();
              });
          }
        });
    });

    // Mostrar cuenta regresiva y luego el ganador
    function showCountdown() {
      mainContent.classList.add("hidden");
      winnerSection.classList.remove("hidden");

      let count = 5;
      countdown.textContent = count;

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          countdown.textContent = count;
        } else {
          clearInterval(interval);
          countdown.classList.add("hidden");
          displayWinner();
        }
      }, 1000);
    }

    // Mostrar tarjeta del ganador con confeti
    function displayWinner() {
      winnerName.textContent = winnerData.Name;
      winnerScore.textContent = `con ${winnerData.Score} puntos`;
      winnerCard.classList.remove("hidden");

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    document.getElementById("close-winner").addEventListener("click", () => {
        winnerSection.classList.add("hidden");
        mainContent.classList.remove("hidden");
        countdown.classList.remove("hidden");
        winnerCard.classList.add("hidden");
      });