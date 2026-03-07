// Addon prices
const addonPrices = {
    'addon-flea': { name: 'Flea & Tick', price: 20 },
    'addon-deshed': { name: 'De-shedding', price: 20 },
    'addon-ear': { name: 'Ear Cleaning', price: 20 },
    'addon-nail': { name: 'Nail Trimming', price: 20 },
    'addon-teeth': { name: 'Teeth Brushing', price: 20 },
    'addon-massage': { name: 'Massage', price: 20 }
};

const packagePrices = {
    'haircut': { name: 'Haircut', price: 25 },
    'spa': { name: 'Spa', price: 30 },
    'brushing': { name: 'Brushing', price: 20 },
    'full': { name: 'Full', price: 50 }
};

function getBasePrice(age)
{
    if (age <= 3) return 30;
    if (age <= 7) return 30 + ((age - 3) / 4) * 10;
    if (age <= 10) return 40 + ((age - 7) / 3) * 10;
    return Math.min(50 + ((age - 10) / 5) * 10, 60);
}

function updateSummary()
{
    // Age + service type label
    const age = parseFloat(document.getElementById('age').value);
    const basePrice = isNaN(age) ? 0 : getBasePrice(age);
    const packageType = document.getElementById('package-type').value;

    let ageLabel = '—';
    if (!isNaN(age))
    {
        if (age <= 3) ageLabel = 'Puppy';
        else if (age <= 7) ageLabel = 'Adult';
        else ageLabel = 'Elderly';
    }

    // Medical
    const medical = document.getElementById('medical');
    const medicalCost = (medical && medical.checked) ? 30 : 0;
    if (medical && medical.checked && ageLabel !== '—') ageLabel += ' + Medical';

    // Summary
    const packageCost = packagePrices[packageType]?.price || 0;
    const packageLabel = packagePrices[packageType]?.name || '—';
    if (ageLabel !== '—') ageLabel += ` | ${packageLabel}`;
    document.getElementById('summary-service').textContent = ageLabel;

    // Datetime
    const datetime = document.getElementById('datetime').value;
    if (datetime)
    {
        const d = new Date(datetime);
        document.getElementById('summary-appointment').textContent =
            d.toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' });
    }
    else
    {
        document.getElementById('summary-appointment').textContent = '<Please Choose Time>';
    }

    // Addons
    let addonTotal = 0;
    const selected = [];
    for (const [id, addon] of Object.entries(addonPrices))
    {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked)
        {
            addonTotal += addon.price;
            selected.push(addon.name);
        }
    }

    // Addon summary text
    const MAX_SHOWN = 2;
    let addonText = 'No add-ons';
    if (selected.length > 0)
    {
        const shown = selected.slice(0, MAX_SHOWN).join(', ');
        const remaining = selected.length - MAX_SHOWN;
        addonText = remaining > 0 ? `${shown} +${remaining} more` : shown;
    }
    document.getElementById('summary-addons').textContent = addonText;

    // Total
    const total = basePrice + packageCost + addonTotal + medicalCost;
    document.getElementById('summary-cost').textContent = `$${total.toFixed(2)}`;
}

// Watchers
['breed', 'datetime', 'age'].forEach(id =>
    document.getElementById(id).addEventListener('input', updateSummary));

document.getElementById('medical').addEventListener('change', updateSummary);
document.getElementById('package-type').addEventListener('change', updateSummary);

Object.keys(addonPrices).forEach(id =>
    document.getElementById(id).addEventListener('change', updateSummary));


// Load URL information (anything selected from the service page's cards)
const params = new URLSearchParams(window.location.search);

const package = params.get('package');
if (package && document.getElementById('package-type'))
{
    document.getElementById('package-type').value = package;
}

const addon = params.get('addon');
if (addon && document.getElementById(addon))
{
    document.getElementById(addon).checked = true;
}

updateSummary();


// Submit form
document.getElementById('booking-form').addEventListener('submit', function (e)
{
    e.preventDefault();

    // Collect all data
    const bookingData = {
        pet: {
            name: document.getElementById('dog-name').value,
            age: document.getElementById('age').value,
            breed: document.getElementById('breed').value,
            medicalNeeds: document.getElementById('medical').checked,
            package: document.getElementById('package-type').value,
            extra: document.getElementById('extra').value
        },
        owner: {
            name: document.getElementById('client-name').value,
            dob: document.getElementById('dob').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            datetime: document.getElementById('datetime').value
        },
        addons: Object.keys(addonPrices).filter(id => document.getElementById(id).checked),
        total: document.getElementById('summary-cost').textContent
    };

    console.log('Booking submitted:', bookingData);

    // Reset form
    this.reset();
    document.getElementById('age').value = 1;
    updateSummary();

    alert('Booking submitted successfully! We will be in touch shortly.');
});