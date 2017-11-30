const getIpData = async () => {
    const response = await fetch('/data');

    return response.json();
};
const getDataByIp = async ip => {
    const response = await fetch(`http://freegeoip.net/json/${ip}`);

    return response.json();
};
const getCurrentIp = async () => {
    const response = await fetch('https://api.ipify.org?format=json');

    return response.json();
};
const getMarkerContentHtml = ({ip, countryName, visitsCount}) => {
    const html = `
        <div class="marker">
            <h3 class="marker__title">Country: ${countryName}</h3>
            <p class="marker__info">
                <b>${visitsCount}</b> visits from IP: <b>${ip}</b>
            </p>
        </div>
    `;

    return html;
};

const initMarkers = (ips, map) => {
    const infoWindow = new google.maps.InfoWindow({
        content: ''
    });
    const loader = new Loader({
        loader: document.getElementById('loader'),
        loaderInner: document.getElementById('loader-inner')
    });
    const ipsLength = ips.length;
    let doneRequestCounter = 0;

    ips.forEach(async ([ip, visitsCount]) => {
        const {
            country_name: countryName,
            latitude,
            longitude
        } = await getDataByIp(ip);
        const markerContent = getMarkerContentHtml({ip, countryName, visitsCount});
        const marker = new google.maps.Marker({
            position: {
                lat: latitude,
                lng: longitude
            },
            map,
            title: countryName,
        });

        marker.addListener('click', function() {
            infoWindow.setContent(markerContent);
            infoWindow.open(map, marker);
        });

        doneRequestCounter++;

        loader.percent = (100 * doneRequestCounter / ipsLength).toFixed(2);
    });
};

class Loader {
    constructor({loader, loaderInner}) {
        this.loader = loader;
        this.loaderInner = loaderInner;
        this._percent = 0;
    }

    set percent(percent) {
        if (percent > 0 || percent <= 100) {
            this._percent = percent;
            this.updateLoader();

            if (percent >= 100) {
                this.end();
            }
        } else {
            throw new Error(`Loader: invalid percent value ${percent}`);
        }
    }

    updateLoader() {
        this.loaderInner.style.width = this._percent + '%';
    }

    end() {
        this.loader.style.opacity = 0;
        setTimeout(() => {
            this.loader.hidden = true;
        }, 1000);
    }
}

async function initMap() {
    const {ip: currentIp} = await getCurrentIp();
    const currentIpData = await getDataByIp(currentIp);
    const current = {lat: currentIpData.latitude, lng: currentIpData.longitude};
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: current
    });
    const ipArray = await getIpData();

    initMarkers(ipArray, map);
}