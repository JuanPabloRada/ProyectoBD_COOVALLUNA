const API = "http://localhost:3000/api";

let asociados = [];

async function cargarAsociados() {

    const response =
        await fetch(`${API}/asociados`);

    asociados =
        await response.json();

    renderTabla(asociados);
}

function renderTabla(data) {

    const tbody =
        document.getElementById("asociadosBody");

    tbody.innerHTML = "";

    data.forEach(a => {

        tbody.innerHTML += `
        <tr>

            <td>${a.cedula_asociado}</td>

            <td>
                ${a.nombres}
                ${a.apellidos}
            </td>

            <td>${a.municipio}</td>

            <td>
                ${new Date(
                    a.fecha_afiliacion
                ).toLocaleDateString()}
            </td>

            <td>
                <span class="badge ${a.estado}">
                    ${a.estado}
                </span>
            </td>

            <td>

                <button class="btn-view">
                    Ver
                </button>

                <button class="btn-edit">
                    Editar
                </button>

            </td>

        </tr>
        `;
    });
}

document
.getElementById("searchInput")
.addEventListener("input", e => {

    const value =
        e.target.value.toLowerCase();

    const filtrados =
        asociados.filter(a =>

            a.cedula_asociado.includes(value)

            ||

            `${a.nombres} ${a.apellidos}`
            .toLowerCase()
            .includes(value)

        );

    renderTabla(filtrados);
});

cargarAsociados();