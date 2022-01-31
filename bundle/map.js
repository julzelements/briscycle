function crel(tag, attrs) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach((attr) => (el[attr[0]] = attr[1]));
  return el;
}

function crelInHead(tag, attrs) {
  const el = crel(tag, attrs);
  document.head.appendChild(el);
  return el;
}

function onload(el) {
  return new Promise((resolve, reject) => {
    el.addEventListener("load", resolve);
    el.addEventListener("error", reject);
  });
}

function initMap() {
  const configEl = document.querySelector("#map-config");
  if (!configEl) return;
  const config = JSON.parse(configEl.content.textContent);

  console.log({ config });

  const ready = Promise.all([
    onload(
      crelInHead("script", {
        src: "https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js",
      })
    ),
    onload(
      crelInHead("link", {
        rel: "stylesheet",
        href: "https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css",
      })
    ),
  ]);

  ready.then(() => {
    // load map
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYXNoa3lkIiwiYSI6ImNsajB0NWMifQ.A8PtczW284fnWFD6dy3xLQ";
    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/ashkyd/ckz2deirj000314qu6dhxh112", // style URL
      center: config.geo || [153, -27.5], // starting position [lng, lat]
      zoom: config.zoom || 8, // starting zoom
    });
    map.scrollZoom.disable();
    map.addControl(new mapboxgl.NavigationControl());

    // add geojson
    if (!config.geojson) return;
    map.on("load", () => {
      const id = "briscycleCustomRoute";
      map.addSource(id, {
        type: "geojson",
        data: config.geojson[0],
      });

      map.addLayer({
        id: id,
        type: "line",
        source: id,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#00ff00",
          "line-width": 6,
        },
        filter: ["==", "$type", "LineString"],
      });

      // Fit bounds
      const coordinates = config.geojson[0].features.reduce(
        (features, feature) => {
          return [...features, ...feature.geometry.coordinates];
        },
        []
      );
      const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
      for (const coord of coordinates) {
        bounds.extend(coord);
      }
      map.fitBounds(bounds, {
        padding: 20,
      });
    });
  });
}

initMap();
