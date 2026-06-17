const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const cedula = document.getElementById("cedula").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!cedula || !password) {
        alert("Complete todos los campos");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cedula,
                    password
                })
            }
        );

        const data = await response.json();

        if(data.success){

            switch(data.rol){

                case "admin":
                    window.location.href =
                        "admin/index.html";
                    break;

                case "asesor":
                    window.location.href =
                        "asesor/index.html";
                    break;

                case "asociado":
                    window.location.href =
                        "asociado/index.html";
                    break;
            }

        }else{
            alert("Credenciales incorrectas");
        }

    } catch(error){

        console.error(error);

        alert(
            "No se pudo conectar con el servidor"
        );
    }

});