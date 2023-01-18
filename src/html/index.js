console.log("hi")

function setButtonDisabled(buttonId, status) {
    $(buttonId).attr("disabled", status);
}
// Formats the money operations input
// https://stackoverflow.com/questions/70175939/format-currency-input-field-with-dollar-sign-commas
$('#iAmount').keydown(function (e) {
    setTimeout(() => {
        let parts = $(this).val().split(".");
        let v = parts[0].replace(/\D/g, ""),
            dec = parts[1]
        let calc_num = Number((dec !== undefined ? v + "." + dec : v));
        /// 1.000.000 should be max
        if (calc_num > 1000000) {
            v = "1000000";
        }
        // use this for numeric calculations
        // console.log('number for calculations: ', calc_num);
        let n = new Intl.NumberFormat('en-EN').format(v);
        n = dec !== undefined ? n + "." + dec : n;
        $(this).val(n);
    })
})

$('#bAddMoney').on('click', (element) => {
    setButtonDisabled('#bAddMoney', true);
    return fetch("/add-money", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ money: $("#iAmount").val() })
    }).finally(() => setButtonDisabled('#bAddMoney', false))
})