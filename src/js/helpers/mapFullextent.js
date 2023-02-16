import { mdiArrowExpandAll } from '@mdi/js';

export default class FullExtent {
  constructor(center = [-80.84, 35.26], zoom = 9.3) {
    this._center = center;
    this._zoom = zoom;
  }

  onAdd(map) {
    this._map = map;
    const _this = this;

    // @see https://seanyeh.com/pages/creating_svgs_in_javascript/
    const svgns = "http://www.w3.org/2000/svg";
    const buttonSvg = document.createElementNS(svgns, 'svg');
    buttonSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    buttonSvg.setAttribute('viewBox', '0 0 24 24');
    buttonSvg.setAttribute('width', '24');
    buttonSvg.setAttribute('height', '24');
    buttonSvg.setAttribute('role', 'img');
    buttonSvg.setAttribute('aria-hidden', 'true');
    const svgPath = buttonSvg.appendChild(document.createElementNS(svgns, 'path'));
    svgPath.setAttribute('d', mdiArrowExpandAll);

    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-fullextent';
    this._btn.type = 'button';
    this._btn.setAttribute('aria-label', 'Zoom map to full extent');
    this._btn.onclick = () => map.flyTo({ center: _this._center, zoom: _this._zoom });
    this._btn.appendChild(buttonSvg);

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
