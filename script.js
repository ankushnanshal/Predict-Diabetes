document.getElementById('predictionForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');
    const probabilityBar = document.getElementById('probabilityBar');
    const probabilityText = document.getElementById('probabilityText');
    const submitBtn = document.querySelector('.btn-submit');

    const formData = {
        Pregnancies: parseFloat(document.getElementById('Pregnancies').value),
        Glucose: parseFloat(document.getElementById('Glucose').value),
        BloodPressure: parseFloat(document.getElementById('BloodPressure').value),
        SkinThickness: parseFloat(document.getElementById('SkinThickness').value),
        Insulin: parseFloat(document.getElementById('Insulin').value),
        BMI: parseFloat(document.getElementById('BMI').value),
        DiabetesPedigreeFunction: parseFloat(document.getElementById('DiabetesPedigreeFunction').value),
        Age: parseInt(document.getElementById('Age').value)
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing Metrics...';

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
            resultContainer.classList.remove('hidden');
            resultContainer.firstElementChild.classList.remove('result-positive', 'result-negative');
            probabilityBar.classList.remove('bg-danger', 'bg-success');

            if (result.prediction === 1) {
                resultText.textContent = 'High Risk of Diabetes Detected';
                resultContainer.firstElementChild.classList.add('result-positive');
                probabilityBar.classList.add('bg-danger');
            } else {
                resultText.textContent = 'Low Risk of Diabetes Detected';
                resultContainer.firstElementChild.classList.add('result-negative');
                probabilityBar.classList.add('bg-success');
            }

            probabilityBar.style.width = `${result.probability}%`;
            probabilityText.textContent = `Calculated Risk Probability: ${result.probability}%`;
            
            resultContainer.scrollIntoView({ behavior: 'smooth' });

        } else {
            alert('API Server Error: ' + (result.error || 'Failed to complete data inference.'));
        }
    } catch (error) {
        console.error('Network error encountered:', error);
        alert('An error occurred connecting to the backend server.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Analyze Risk';
    }
});