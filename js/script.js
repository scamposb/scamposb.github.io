document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bet-form");
  form.addEventListener("submit", handleSubmit);
});

function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const nombre = formData.get("name");
  const year = new Date().getFullYear();

  const favouriteRaw = formData.get("favourite");
  const favourite = (favouriteRaw || "").toLowerCase();

  // Easter eggs
  if (favourite === "francia") {
    const franceModal = document.getElementById("franceModal");
    const franceImg = document.getElementById("franceImg");

    franceImg.src = `img/gatito.jpg`;
    franceModal.classList.remove("hidden");

    setTimeout(() => {
      franceModal.classList.add("hidden");
    }, 4000);

    return; // Cancelar el envío para Francia también
  }

  if (favourite === "israel") {
    const israelModal = document.getElementById("israelModal");
    israelModal.classList.remove("hidden");

    setTimeout(() => {
      israelModal.classList.add("hidden");
    }, 4000);
    return;
  }

  const data = {
    winner: formData.get("winner"),
    lastPlace: formData.get("lastPlace"),
    spain: parseInt(formData.get("spain"), 10),
    halfTable: parseInt(formData.get("halfTable"), 10),
    favourite: favouriteRaw,
  };

  const url = `${SERVER_URL}/bet/${year}/${encodeURIComponent(nombre)}`;



  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Error en la solicitud");
      }
      return res.json();
    })
    .then((responseData) => {
      const messageDiv = document.getElementById("message");
      messageDiv.textContent = "✅ ¡Apuesta enviada con éxito!";
      messageDiv.classList.remove("opacity-0", "translate-y-2");
      messageDiv.classList.add("opacity-100", "translate-y-0");

      // Reiniciar formulario
      form.reset();

      // Ocultar mensaje tras 4 segundos
      setTimeout(() => {
        messageDiv.classList.add("opacity-0", "translate-y-2");
        messageDiv.classList.remove("opacity-100", "translate-y-0");
      }, 4000);
    })
    .catch((err) => {
      console.error("Error:", err);
      const messageDiv = document.getElementById("message");
      messageDiv.textContent = "❌ Hubo un error al enviar la apuesta.";
      messageDiv.classList.remove("opacity-0", "translate-y-2");
      messageDiv.classList.add("opacity-100", "translate-y-0");

      setTimeout(() => {
        messageDiv.classList.add("opacity-0", "translate-y-2");
        messageDiv.classList.remove("opacity-100", "translate-y-0");
      }, 4000);
    });
}
