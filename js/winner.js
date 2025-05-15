const yearSelect = document.getElementById('year-select');
const checkWinnerBtn = document.getElementById('check-winner');
const errorMessage = document.getElementById('error-message');
const mainContent = document.getElementById('main-content');
const winnerSection = document.getElementById('winner-section');
const countdown = document.getElementById('countdown');
const winnerCard = document.getElementById('winner-card');
const winnerName = document.getElementById('winner-name');
const winnerScore = document.getElementById('winner-score');
const showRankingBtn = document.getElementById('show-ranking');
const rankingContainer = document.getElementById('ranking');
const rankingList = document.getElementById('ranking-list');

    let selectedYear = "";
    let winnerData = null;

    // Poblar el selector con los años disponibles
    fetch("https://euroviapp-production.up.railway.app/polls")
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

      fetch("https://euroviapp-production.up.railway.app/polls")
        .then(res => res.json())
        .then(data => {
          const isOpen = data.polls[selectedYear]?.isOpen;
          if (isOpen) {
            errorMessage.textContent = "La porra tiene que estar cerrada para calcular el ganador.";
            errorMessage.classList.remove("hidden");
          } else {
            fetch(`https://euroviapp-production.up.railway.app/winner/${selectedYear}`)
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
      const [first, ...rest] = winnerData;
      winnerName.textContent = first.Name;
      winnerScore.textContent = `con ${first.Score} puntos`;
      winnerCard.classList.remove("hidden");
    
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    
      showRankingBtn.classList.remove("hidden");
    }

    showRankingBtn.addEventListener("click", () => {
      rankingList.innerHTML = "";
    
      const sortedData = [...winnerData].sort((a, b) => b.Score - a.Score);
    
      let currentRank = 1;
      let displayedRank = 1;
      let lastScore = null;
    
      const medalIcons = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
      };
    
      sortedData.forEach((participant, index) => {
        if (participant.Score !== lastScore) {
          displayedRank = currentRank;
        }
    
        lastScore = participant.Score;
    
        const li = document.createElement("li");
    
        // Solo mostrar medalla si está en el top 3
        const medal = medalIcons[displayedRank] || '';
        const prefix = medal ? `${medal} ` : '';
    
        li.innerHTML = `<span class="font-semibold">${prefix}${participant.Name}</span> - ${participant.Score} puntos`;
        rankingList.appendChild(li);
    
        currentRank++;
      });
    
      rankingContainer.classList.remove("hidden");
      showRankingBtn.classList.add("hidden");
    });
    
    
    
    document.getElementById("close-winner").addEventListener("click", () => {
      winnerSection.classList.add("hidden");
      mainContent.classList.remove("hidden");
      countdown.classList.remove("hidden");
      countdown.textContent = "";
      winnerCard.classList.add("hidden");
      rankingContainer.classList.add("hidden");
      showRankingBtn.classList.remove("hidden");
    });
    