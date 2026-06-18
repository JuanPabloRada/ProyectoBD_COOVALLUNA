const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cedula   = document.getElementById("cedula").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!cedula || !password) {
    alert("Complete todos los campos");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Guardar nombre en sessionStorage para usarlo en los dashboards
      sessionStorage.setItem("coovalluna_nombre", data.nombre);
      sessionStorage.setItem("coovalluna_rol",    data.rol);
      sessionStorage.setItem("coovalluna_cedula", cedula);

      
      switch (data.rol) {
        case "admin":    window.location.href = "admin/index.html";    break;
        case "asesor":   window.location.href = "asesor/index.html";   break;
        case "asociado": window.location.href = "asociado/index.html"; break;
        default:
          alert("Rol desconocido. Contacte soporte.");
      }
    } else {
      // El servidor devuelve data.mensaje cuando success = false
      alert(data.mensaje || "Credenciales incorrectas");
    }

  } catch (error) {
    console.error("Error de red:", error);
    alert("No se pudo conectar con el servidor. Verifique que el backend esté corriendo.");
  }
});
