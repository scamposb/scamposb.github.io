// Función global para manejar el envío del formulario (accesible desde el HTML)
function handleSubmit(event) {
  event.preventDefault(); // Evita que se recargue la página

  const form = event.target;
  const formData = new FormData(form);

  const nombre = formData.get("name");
  const year = new Date().getFullYear();

  const data = {
    winner: formData.get("winner"),
    lastPlace: formData.get("lastPlace"),
    spain: parseInt(formData.get("spain"), 10),
    halfTable: parseInt(formData.get("halfTable"), 10),
    favourite: formData.get("favourite"),
  };

  const url = `http://192.168.1.46/bet/${year}/${encodeURIComponent(nombre)}`;

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
      alert("¡Apuesta enviada con éxito!");
      console.log("Respuesta del servidor:", responseData);
      form.reset(); // Limpia el formulario
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Hubo un error al enviar tu apuesta. Inténtalo de nuevo.");
    });
}
