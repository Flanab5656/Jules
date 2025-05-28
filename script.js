console.log("Script loaded");

let allStrategists = []; // Store fetched strategists globally

async function fetchStrategists() {
    try {
        const response = await fetch('strategists.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allStrategists = await response.json(); // Store in global variable
        return allStrategists;
    } catch (error) {
        console.error("Could not fetch strategists:", error);
        allStrategists = []; // Ensure it's empty on error
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.innerHTML = '<p>Error loading strategist data. Please try again later.</p>';
        }
        return []; // Return empty array on error
    }
}

function renderStrategistCards(strategists) {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) {
        console.error("App container not found!");
        return;
    }
    appContainer.innerHTML = ''; // Clear previous content

    strategists.forEach(strategist => {
        const card = document.createElement('div');
        card.className = 'strategist-card';
        card.setAttribute('data-id', strategist.id);

        card.addEventListener('click', () => {
            showStrategistDetails(strategist.id);
        });

        const img = document.createElement('img');
        img.src = strategist.pictureUrl;
        img.alt = `Photo of ${strategist.name}`;
        img.onerror = () => {
            img.src = 'images/profile_placeholder.png';
            img.alt = 'Placeholder image';
        };
        card.appendChild(img);

        const nameElement = document.createElement('h2');
        nameElement.textContent = strategist.name;
        card.appendChild(nameElement);

        const expertiseTitle = document.createElement('h3');
        expertiseTitle.textContent = 'Expertise:';
        card.appendChild(expertiseTitle);
        const expertiseList = document.createElement('ul');
        strategist.expertise.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            expertiseList.appendChild(listItem);
        });
        card.appendChild(expertiseList);

        const skillsTitle = document.createElement('h3');
        skillsTitle.textContent = 'Core Skills:';
        card.appendChild(skillsTitle);
        const skillsList = document.createElement('ul');
        strategist.coreSkills.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            skillsList.appendChild(listItem);
        });
        card.appendChild(skillsList);

        appContainer.appendChild(card);
    });

    if (strategists.length === 0 && appContainer.innerHTML.trim() === '') {
        // Check if a search term was active or it's just no strategists initially
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim() !== '') {
            appContainer.innerHTML = '<p>No strategists found matching your search.</p>';
        } else if (searchInput && searchInput.value.trim() === '' && allStrategists.length > 0) {
            // This case might occur if allStrategists is populated but something else went wrong
            // or if the search term was cleared and there are still no results (which shouldn't happen if allStrategists has items)
            // For now, let's assume if strategists is empty and search is empty, it's the initial "no profiles" message.
        } else if (allStrategists.length === 0) {
             appContainer.innerHTML = '<p>No strategist profiles available at the moment.</p>';
        }
    }
}


function performSearch(searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const appContainer = document.getElementById('app-container');

    if (!lowerSearchTerm) {
        renderStrategistCards(allStrategists);
        return;
    }

    const filteredStrategists = allStrategists.filter(strategist => {
        if (strategist.name.toLowerCase().includes(lowerSearchTerm)) return true;
        if (strategist.bio.toLowerCase().includes(lowerSearchTerm)) return true;
        if (strategist.expertise.some(e => e.toLowerCase().includes(lowerSearchTerm))) return true;
        if (strategist.keyClients.some(kc => kc.toLowerCase().includes(lowerSearchTerm))) return true;
        if (strategist.coreSkills.some(cs => cs.toLowerCase().includes(lowerSearchTerm))) return true;
        if (strategist.strategicPositions.some(sp => sp.title.toLowerCase().includes(lowerSearchTerm))) return true;
        return false;
    });

    if (filteredStrategists.length === 0) {
        if(appContainer) appContainer.innerHTML = '<p>No strategists found matching your search.</p>';
        renderStrategistCards([]); // Call with empty to ensure no old cards are shown
    } else {
        renderStrategistCards(filteredStrategists);
    }
}


function showStrategistDetails(strategistId) {
    const strategist = allStrategists.find(s => s.id === strategistId);
    if (!strategist) {
        console.error("Strategist not found for ID:", strategistId);
        return;
    }

    // Remove existing modal if any
    const existingModal = document.getElementById('strategist-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'strategist-modal';
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
        modal.style.display = 'none';
        modal.remove();
    };
    modalContent.appendChild(closeButton);

    const nameElement = document.createElement('h2');
    nameElement.textContent = strategist.name;
    modalContent.appendChild(nameElement);

    const img = document.createElement('img');
    img.src = strategist.pictureUrl;
    img.alt = `Photo of ${strategist.name}`;
    img.onerror = () => {
        img.src = 'images/profile_placeholder.png';
        img.alt = 'Placeholder image';
    };
    modalContent.appendChild(img);

    const bioElement = document.createElement('p');
    bioElement.className = 'modal-bio';
    bioElement.textContent = strategist.bio;
    modalContent.appendChild(bioElement);

    const clientsTitle = document.createElement('h3');
    clientsTitle.textContent = 'Key Clients:';
    modalContent.appendChild(clientsTitle);
    const clientsList = document.createElement('ul');
    strategist.keyClients.forEach(client => {
        const listItem = document.createElement('li');
        listItem.textContent = client;
        clientsList.appendChild(listItem);
    });
    modalContent.appendChild(clientsList);

    const positionsTitle = document.createElement('h3');
    positionsTitle.textContent = 'Strategic Positions:';
    modalContent.appendChild(positionsTitle);
    const positionsList = document.createElement('ul');
    strategist.strategicPositions.forEach(position => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = position.url;
        link.textContent = position.title;
        link.target = '_blank';
        listItem.appendChild(link);
        positionsList.appendChild(listItem);
    });
    modalContent.appendChild(positionsList);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.style.display = 'block';
}


window.onload = async () => {
    console.log("Window loaded, fetching strategists...");
    await fetchStrategists(); 

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            performSearch(event.target.value);
        });
    }

    if (allStrategists && allStrategists.length > 0) {
        renderStrategistCards(allStrategists);
    } else {
        console.log("No strategists to render or error occurred during initial load.");
        const appContainer = document.getElementById('app-container');
        // Only set "No strategist profiles" if not already showing an error from fetchStrategists
        if (appContainer && appContainer.innerHTML.trim() === '') { 
            appContainer.innerHTML = '<p>No strategist profiles available at the moment.</p>';
        }
    }
};
