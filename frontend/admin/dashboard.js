const API = "http://localhost:3000/api";

async function cargarDashboard() {

    try {

        const [
            asociadosRes,
            creditosRes,
            cuentasRes,
            empleadosRes
        ] = await Promise.all([
            fetch(`${API}/asociados`),
            fetch(`${API}/creditos`),
            fetch(`${API}/cuentas`),
            fetch(`${API}/empleados`)
        ]);

        const asociados = await asociadosRes.json();
        const creditos = await creditosRes.json();
        const cuentas = await cuentasRes.json();
        const empleados = await empleadosRes.json();

        document.getElementById("asociados").textContent =
            asociados.length;

        document.getElementById("creditos").textContent =
            creditos.length;

        document.getElementById("cuentas").textContent =
            cuentas.length;

        document.getElementById("empleados").textContent =
            empleados.length;

        const cartera = creditos.reduce((sum, c) =>
            sum + Number(c.valor_aprobado || 0), 0);

        document.getElementById("cartera").textContent =
            "$ " + cartera.toLocaleString("es-CO");

        const mora = creditos.filter(c =>
            c.estado_credito === "EN_MORA"
        ).length;

        document.getElementById("mora").textContent =
            mora;

        cargarTabla(creditos);
        crearGrafica(creditos);

    } catch (error) {
        console.error(error);
    }
}

function cargarTabla(creditos){

    const tbody =
        document.getElementById("tablaCreditos");

    tbody.innerHTML = "";

    creditos.slice(0,5).forEach(c => {

        tbody.innerHTML += `
            <tr>
                <td>${c.numero_radicado}</td>
                <td>${c.linea_credito}</td>
                <td>${c.estado_credito}</td>
                <td>
                    $${Number(
                        c.valor_aprobado || 0
                    ).toLocaleString("es-CO")}
                </td>
            </tr>
        `;
    });
}

function crearGrafica(creditos){

    const estados = {};

    creditos.forEach(c => {

        estados[c.estado_credito] =
            (estados[c.estado_credito] || 0) + 1;

    });

    new Chart(
        document.getElementById("chartEstados"),
        {
            type:"doughnut",
            data:{
                labels:Object.keys(estados),
                datasets:[{
                    data:Object.values(estados)
                }]
            }
        }
    );
}

document.querySelector(".logout")
.addEventListener("click", () => {

    window.location.href = "../index.html";

});

cargarDashboard();