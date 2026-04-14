const translations = {
    "Prag" : "Prague",
    "Berlin" : "Berlin",
    "Budimpešta" : "Budapest",
    "Kušadasi" : "Kusadasi",
    "Marakeš" : "Marrakech",
    "Hurgada" : "Hurghada",
    "Les Menuires" : "Les Menuires",
    "Kopaonik" : "Kopaonik",
    "Bansko" : "Bansko"
};

document.addEventListener('DOMContentLoaded', () => {
    const lang = document.body.dataset.lang || 'sr';

    const texts = {
        sr: {
            noActive: 'Nemate aktivnih rezervacija.',
            cancel: 'Otkaži',
            cancelDisabled: 'Otkazivanje nije moguće (manje od 5 dana)',
            visitedNone: 'Nema posećenih destinacija.',
            rateLabel: 'Ocenite destinaciju:',
            saveRating: 'Sačuvaj ocenu',
            ratingAlert: 'Ocena mora biti između 1 i 5.',
            ratingSaved: 'Ocena sačuvana!',
            priceLabel: 'Cena'
        },
        en: {
            noActive: 'No active reservations.',
            cancel: 'Cancel',
            cancelDisabled: 'Cancellation not allowed (less than 5 days)',
            visitedNone: 'No visited destinations.',
            rateLabel: 'Rate this destination:',
            saveRating: 'Save rating',
            ratingAlert: 'Rating must be between 1 and 5.',
            ratingSaved: 'Rating saved!',
            priceLabel: 'Price'
        }
    };

    const bookingForm = document.querySelector('form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', e => {
            e.preventDefault();

            const name  = document.getElementById('name').value.trim();
            const start = document.getElementById('startDate').value.trim();
            const end   = document.getElementById('endDate').value.trim();

            const destination = bookingForm.dataset.destination || 'Nepoznata destinacija';
            const price = parseFloat(bookingForm.dataset.price || 0);

            if (!name || !start || !end) {
                alert(lang === 'sr' ? 'Molimo popunite sva polja.' : 'Please fill all fields.');
                return;
            }

            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            const newId = reservations.length ? Math.max(...reservations.map(r => r.id)) + 1 : 1;

            reservations.push({
                id: newId,
                destination,
                name,
                startDate: start,
                endDate: end,
                price,
                rating: null,
                image: bookingForm.closest('.row').querySelector('img')?.src || ''
            });

            localStorage.setItem('reservations', JSON.stringify(reservations));
            alert(lang === 'sr' ? `Uspešno ste rezervisali putovanje u ${destination}!` : `Successfully booked a trip to ${destination}!`);
            bookingForm.reset();
        });
    }

    const reservationsList = document.getElementById('reservationsList');
    const visitedList = document.getElementById('visitedList');

    if (reservationsList || visitedList) {
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const today = new Date();

        const activeReservations = [];
        const visitedDestinations = [];

        reservations.forEach(res => {
            const start = new Date(res.startDate);
            const end = new Date(res.endDate);

            if (end < today) {
                visitedDestinations.push(res);
            } else {
                activeReservations.push(res);
            }
        });

        localStorage.setItem('reservations', JSON.stringify(activeReservations.concat(visitedDestinations)));

        if (reservationsList) {
            reservationsList.innerHTML = '';
            if (!activeReservations.length) {
                reservationsList.innerHTML = `<p>${texts[lang].noActive}</p>`;
            } else {
                activeReservations.forEach((res, idx) => {
                    let destinationName = res.destination;
                    if (Object.entries(destinationName) && document.body.getAttribute("data-lang") == "en") {
                        destinationName = translations[destinationName];
                    }
                    const start = new Date(res.startDate);
                    const diffDays = Math.floor((start - today) / (1000*60*60*24));
                    const cancelAllowed = diffDays >= 5;

                    const col = document.createElement('div');
                    col.className = 'col-md-6';
                    col.innerHTML = `
                        <div class="card p-3 shadow-sm">
                            ${res.image ? `<img src="${res.image}" alt="${res.destination}" class="img-fluid rounded mb-2">` : ''}
                            <h5>${destinationName}</h5>
                            <p>${res.name}</p>
                            <p>${res.startDate.slice(8, 10)}.${res.startDate.slice(5, 7)}.${res.startDate.slice(0, 4)}. ⟶ ${res.endDate.slice(8, 10)}.${res.endDate.slice(5, 7)}.${res.endDate.slice(0, 4)}.</p>
                            <p>${texts[lang].priceLabel}: $${res.price}</p>
                            ${cancelAllowed ? `<button class="btn btn-danger cancel-btn">${texts[lang].cancel}</button>` : `<small class="text-muted">${texts[lang].cancelDisabled}</small>`}
                        </div>
                    `;
                    reservationsList.appendChild(col);

                    const btn = col.querySelector('.cancel-btn');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            if (confirm(lang === 'sr' ? 'Da li ste sigurni da želite da otkažete rezervaciju?' : 'Are you sure you want to cancel this reservation?')) {
                                activeReservations.splice(idx,1);
                                localStorage.setItem('reservations', JSON.stringify(activeReservations.concat(visitedDestinations)));
                                location.reload();
                            }
                        });
                    }
                });
            }
        }

        if (visitedList) {
            visitedList.innerHTML = '';
            if (!visitedDestinations.length) {
                visitedList.innerHTML = `<p>${texts[lang].visitedNone}</p>`;
            } else {
                visitedDestinations.forEach((res, idx) => {
                    let destinationName = res.destination;
                    if (Object.entries(destinationName) && document.body.getAttribute("data-lang") == "en") {
                        destinationName = translations[destinationName];
                    }
                    const col = document.createElement('div');
                    col.className = 'col-md-6';
                    col.innerHTML = `
                        <div class="card p-3 shadow-sm">
                            ${res.image ? `<img src="${res.image}" alt="${res.destination}" class="img-fluid rounded mb-2">` : ''}
                            <h5>${destinationName}</h5>
                            <p>${res.name}</p>
                            <p>${res.startDate.slice(8, 10)}.${res.startDate.slice(5, 7)}.${res.startDate.slice(0, 4)}. ⟶ ${res.endDate.slice(8, 10)}.${res.endDate.slice(5, 7)}.${res.endDate.slice(0, 4)}.</p>
                            <label>${texts[lang].rateLabel}</label>
                            <input type="number" min="1" max="5" class="form-control mb-2 ratingInput" value="${res.rating || ''}">
                            <button class="btn btn-primary saveRating">${texts[lang].saveRating}</button>
                        </div>
                    `;
                    visitedList.appendChild(col);

                    col.querySelector('.saveRating').addEventListener('click', () => {
                        const rating = col.querySelector('.ratingInput').value;
                        if (rating >= 1 && rating <= 5) {
                            visitedDestinations[idx].rating = rating;
                            localStorage.setItem('reservations', JSON.stringify(activeReservations.concat(visitedDestinations)));
                            alert(texts[lang].ratingSaved);
                        } else {
                            alert(texts[lang].ratingAlert);
                        }
                    });
                });
            }
        }
    }
});

document.querySelectorAll('.slider-container').forEach(container => {
    const slidesContainer = container.querySelector('.slides');
    const slides = slidesContainer.querySelectorAll('.slide');
    const total = slides.length;
    let current = 0;

    const updateSlide = () => {
        slidesContainer.style.transform = `translateX(-${current * 100}%)`;
    };

    container.querySelector('.prev').addEventListener('click', () => {
        current = (current - 1 + total) % total;
        updateSlide();
    });

    container.querySelector('.next').addEventListener('click', () => {
        current = (current + 1) % total;
        updateSlide();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    
    if (document.getElementById("destination-title") != null){
        let fullTitle = document.getElementById("destination-title").innerText.trim();
        let destination = fullTitle.split(" - ")[0];
        destination = destination.slice(2);

        if (Object.values(translations).includes(destination)) {
        const key = Object.keys(translations).find(k => translations[k] === destination);
        destination = key;
        }

        const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
        const destinationReservations = reservations.filter(r => r.destination === destination);

        const ratings = destinationReservations
            .map(r => parseInt(r.rating))
            .filter(r => r !== null && !isNaN(r));

        if (ratings.length > 0) {
            const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            document.getElementById("avg-rating").textContent = `⭐ ${avg.toFixed(1)}/5`;
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const destinations = document.querySelectorAll(".dest-item");

    if(searchBar && destinations) {
        searchBar.addEventListener("keyup", () => {
        const query = searchBar.value.toLowerCase();

        destinations.forEach(dest => {
            const text = dest.querySelector("h4").innerText.toLowerCase();
            if (text.includes(query)) {
                dest.style.display = "";
            } else {
                dest.style.display = "none";
            }
        });
    });
    }
    
});