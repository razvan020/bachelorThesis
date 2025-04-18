function increment(id) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value) + 1;
    updateTotal();
}

function decrement(id) {
    const input = document.getElementById(id);
    if (parseInt(input.value) > 0) {
        input.value = parseInt(input.value) - 1;
    }
    updateTotal();
}

function updateTotal() {
    const adults = parseInt(document.getElementById("adults").value);
    const children = parseInt(document.getElementById("children").value);
    const infants = parseInt(document.getElementById("infants").value);
    const total = `${adults} adult${adults > 1 ? 's' : ''}`;
    document.getElementById("totalPassengers").textContent = total +
        (children > 0 ? `, ${children} child${children > 1 ? 'ren' : ''}` : '') +
        (infants > 0 ? `, ${infants} infant${infants > 1 ? 's' : ''}` : '');
}

document.getElementById("dropdownBtn").addEventListener("click", () => {
    const content = document.getElementById("dropdownContent");
    content.style.display = content.style.display === "block" ? "none" : "block";
});