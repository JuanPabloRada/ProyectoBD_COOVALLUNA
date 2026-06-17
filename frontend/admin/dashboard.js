async function cargarDashboard(){

    try{

        const res = await fetch(
            "http://localhost:3000/api/dashboard"
        );

        const data = await res.json();

        document.getElementById("asociados").textContent =
            data.asociados;

        document.getElementById("creditos").textContent =
            data.creditos;

        document.getElementById("cartera").textContent =
            "$" + data.cartera.toLocaleString();

        document.getElementById("mora").textContent =
            data.mora;

        const tbody =
            document.getElementById("movimientos");

        data.movimientos.forEach(m => {

            tbody.innerHTML += `
                <tr>
                    <td>${m.cuenta}</td>
                    <td>${m.tipo}</td>
                    <td>$${m.valor}</td>
                </tr>
            `;

        });

        const alertas =
            document.getElementById("alertas");

        data.alertas.forEach(a => {

            alertas.innerHTML += `
                <li>${a}</li>
            `;

        });

        new Chart(
            document.getElementById("creditChart"),
            {
                type:"line",
                data:{
                    labels:data.grafica.labels,
                    datasets:[{
                        label:"Créditos",
                        data:data.grafica.data,
                        borderColor:"#2563EB",
                        fill:false
                    }]
                }
            }
        );

    }catch(error){
        console.error(error);
    }

}

cargarDashboard();