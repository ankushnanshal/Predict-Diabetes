const authModal = document.getElementById('authModal');
const signInView = document.getElementById('signInView');
const signUpView = document.getElementById('signUpView');
const navLoginBtn = document.getElementById('navLoginBtn');
const navLogoutBtn = document.getElementById('navLogoutBtn');
const userGreetingSection = document.getElementById('userGreetingSection');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const authBlocker = document.getElementById('authBlocker');
const closeModalBtn = document.getElementById('closeModalBtn');

const genderSelect = document.getElementById('Gender');
const pregnanciesGroup = document.getElementById('pregnanciesGroup');
const pregnanciesInput = document.getElementById('Pregnancies');

genderSelect.addEventListener('change', function() {
    if (this.value === 'Female') {
        pregnanciesGroup.classList.remove('hidden');
        pregnanciesInput.required = true;
    } else {
        pregnanciesGroup.classList.add('hidden');
        pregnanciesInput.required = false;
        pregnanciesInput.value = '0'; 
    }
});

document.getElementById('switchToSignUp').addEventListener('click', () => {
    signInView.classList.add('hidden');
    signUpView.classList.remove('hidden');
});

document.getElementById('switchToSignIn').addEventListener('click', () => {
    signUpView.classList.add('hidden');
    signInView.classList.remove('hidden');
});

const showModal = () => authModal.classList.remove('hidden');
const hideModal = () => {
    authModal.classList.add('hidden');
    document.getElementById('signInError').classList.add('hidden');
    document.getElementById('signUpError').classList.add('hidden');
};

navLoginBtn.addEventListener('click', showModal);
document.getElementById('blockerLoginBtn').addEventListener('click', showModal);
closeModalBtn.addEventListener('click', hideModal);

function checkLoginState() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        navLoginBtn.classList.add('hidden');
        userGreetingSection.classList.remove('hidden');
        userEmailDisplay.textContent = userEmail;
        authBlocker.classList.add('hidden'); 
    } else {
        navLoginBtn.classList.remove('hidden');
        userGreetingSection.classList.add('hidden');
        userEmailDisplay.textContent = '';
        authBlocker.classList.remove('hidden'); 
        document.getElementById('resultContainer').classList.add('hidden');
    }
}

document.getElementById('signUpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const errorDiv = document.getElementById('signUpError');

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userEmail', email);
            hideModal();
            checkLoginState();
        } else {
            errorDiv.textContent = data.error || 'Failed to sign up.';
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        errorDiv.textContent = 'Network authentication error occurred.';
        errorDiv.classList.remove('hidden');
    }
});

document.getElementById('signInForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const errorDiv = document.getElementById('signInError');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userEmail', email);
            hideModal();
            checkLoginState();
        } else {
            errorDiv.textContent = data.error || 'Failed to log in.';
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        errorDiv.textContent = 'Network authentication error occurred.';
        errorDiv.classList.remove('hidden');
    }
});

navLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userEmail');
    checkLoginState();
});

checkLoginState();

document.getElementById('predictionForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');
    const probabilityBar = document.getElementById('probabilityBar');
    const probabilityText = document.getElementById('probabilityText');
    const submitBtn = document.querySelector('.btn-submit');

    const formData = {
        Pregnancies: parseFloat(document.getElementById('Pregnancies').value || 0),
        Gender: document.getElementById('Gender').value,
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
            headers: { 'Content-Type': 'application/json' },
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