/* ============================================================
   iFOX · PLAYGROUND SVG — presety do lekcji bonusowej "Ogień"
   Wklej do tablicy PRESETS w svgp-global.html, na końcu,
   po presecie "filter-szum" (feTurbulence).

   Wywołanie w treści lekcji:
     <div class="svgp-root" data-preset="ogien-ksztalt"></div>
     <div class="svgp-root" data-preset="ogien-pelny"></div>
   ============================================================ */

    {
      id:"ogien-ksztalt", tab:"ogień · kształt",
      note:"Płomień zaczyna się od <b>zwykłego gradientu</b>. <code>feTurbulence</code> robi losowość, a <code>feDisplacementMap</code> rozrywa nią gradient na języki. Ustaw rozproszenie na 0 — zostanie goły gradient, czyli to, czym ogień naprawdę jest pod spodem.",
      params:[
        {id:"bf",  label:"częstotliwość · x", min:0.005, max:0.06, step:0.001, val:0.018},
        {id:"bfy", label:"częstotliwość · y", min:0.01,  max:0.20, step:0.005, val:0.06},
        {id:"oct", label:"oktawy", min:1, max:5, step:1, val:3},
        {id:"sc",  label:"rozproszenie", min:0, max:140, step:5, val:90}
      ],
      code:
'<svg viewBox="0 0 260 180" width="340">\n'+
'  <defs>\n'+
'    <linearGradient id="zar" x1="0" y1="1" x2="0" y2="0">\n'+
'      <stop offset="0"    stop-color="#ffffff"/>\n'+
'      <stop offset="0.20" stop-color="#bbbbbb"/>\n'+
'      <stop offset="0.56" stop-color="#333333"/>\n'+
'      <stop offset="0.92" stop-color="#000000"/>\n'+
'    </linearGradient>\n'+
'\n'+
'    <filter id="plomien"\n'+
'            x="-30%" y="-30%"\n'+
'            width="160%" height="160%">\n'+
'      <feTurbulence type="fractalNoise"\n'+
'                    baseFrequency="{{bf}} {{bfy}}"\n'+
'                    numOctaves="{{oct}}"\n'+
'                    seed="7" result="szum"/>\n'+
'      <feDisplacementMap in="SourceGraphic" in2="szum"\n'+
'                         scale="{{sc}}"\n'+
'                         xChannelSelector="R"\n'+
'                         yChannelSelector="G" result="ksztalt"/>\n'+
'      <feComponentTransfer in="ksztalt">\n'+
'        <feFuncR type="table" tableValues="0 0.16 0.63 0.9 1 1"/>\n'+
'        <feFuncG type="table" tableValues="0 0 0.08 0.43 0.86 1"/>\n'+
'        <feFuncB type="table" tableValues="0 0 0 0 0.24 1"/>\n'+
'      </feComponentTransfer>\n'+
'    </filter>\n'+
'  </defs>\n'+
'\n'+
'  <rect width="260" height="180" fill="#000"/>\n'+
'  <g filter="url(#plomien)">\n'+
'    <rect x="-40" y="-40" width="340" height="260" fill="#000"/>\n'+
'    <rect x="-40" y="20"  width="340" height="160" fill="url(#zar)"/>\n'+
'  </g>\n'+
'</svg>'
    },
    {
      id:"ogien-pelny", tab:"ogień · pełny",
      note:"Ten sam filtr plus ruch. Dwa szumy przewijają się w górę i <b>mieszają na przemian</b>, żeby przewinięcie nigdy nie skoczyło na oczach widza. Wiatr to <code>skewX</code> z osią przy palniku, temperatura przesuwa progi gradientu.",
      params:[
        {id:"wind", label:"wiatr · pochylenie", min:-15, max:15, step:1, val:0},
        {id:"dx",   label:"wiatr · znoszenie", min:-40, max:40, step:2, val:0},
        {id:"t2",   label:"temperatura · próg", min:0.06, max:0.34, step:0.01, val:0.20},
        {id:"sc",   label:"rozerwanie", min:40, max:140, step:5, val:90},
        {id:"dur",  label:"cykl (s)", min:8, max:40, step:2, val:26}
      ],
      code:
'<svg viewBox="0 0 260 180" width="340">\n'+
'  <defs>\n'+
'    <linearGradient id="zar2" x1="0" y1="1" x2="0" y2="0">\n'+
'      <stop offset="0"     stop-color="#ffffff"/>\n'+
'      <stop offset="{{t2}}" stop-color="#bbbbbb"/>\n'+
'      <stop offset="0.60"  stop-color="#333333"/>\n'+
'      <stop offset="0.92"  stop-color="#000000"/>\n'+
'    </linearGradient>\n'+
'\n'+
'    <filter id="ogien"\n'+
'            filterUnits="userSpaceOnUse"\n'+
'            x="-80" y="-30" width="420" height="620">\n'+
'\n'+
'      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.06"\n'+
'                    numOctaves="3" seed="7" result="a"/>\n'+
'      <feColorMatrix in="a" type="matrix" result="a1"\n'+
'        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1"/>\n'+
'      <feOffset in="a1" dx="{{dx}}" dy="0" result="szum1">\n'+
'        <animate attributeName="dy" from="0" to="-400"\n'+
'                 dur="{{dur}}s" repeatCount="indefinite"/>\n'+
'      </feOffset>\n'+
'\n'+
'      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.06"\n'+
'                    numOctaves="3" seed="23" result="b"/>\n'+
'      <feColorMatrix in="b" type="matrix" result="b1"\n'+
'        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1"/>\n'+
'      <feOffset in="b1" dx="{{dx}}" dy="0" result="szum2">\n'+
'        <animate attributeName="dy" from="0" to="-400"\n'+
'                 dur="{{dur}}s" begin="-13s" repeatCount="indefinite"/>\n'+
'      </feOffset>\n'+
'\n'+
'      <feComposite in="szum1" in2="szum2" operator="arithmetic"\n'+
'                   k1="0" k2="0" k3="1" k4="0" result="miks">\n'+
'        <animate attributeName="k2" values="0;1;0"\n'+
'                 dur="{{dur}}s" repeatCount="indefinite"/>\n'+
'        <animate attributeName="k3" values="1;0;1"\n'+
'                 dur="{{dur}}s" repeatCount="indefinite"/>\n'+
'      </feComposite>\n'+
'\n'+
'      <feDisplacementMap in="SourceGraphic" in2="miks"\n'+
'                         scale="{{sc}}"\n'+
'                         xChannelSelector="R"\n'+
'                         yChannelSelector="G" result="ksztalt"/>\n'+
'\n'+
'      <feComponentTransfer in="ksztalt">\n'+
'        <feFuncR type="table" tableValues="0 0.16 0.63 0.9 1 1"/>\n'+
'        <feFuncG type="table" tableValues="0 0 0.08 0.43 0.86 1"/>\n'+
'        <feFuncB type="table" tableValues="0 0 0 0 0.24 1"/>\n'+
'      </feComponentTransfer>\n'+
'    </filter>\n'+
'\n'+
'    <clipPath id="kadr"><rect width="260" height="180"/></clipPath>\n'+
'  </defs>\n'+
'\n'+
'  <rect width="260" height="180" fill="#000"/>\n'+
'  <g clip-path="url(#kadr)">\n'+
'    <g filter="url(#ogien)">\n'+
'      <rect x="-80" y="-30" width="420" height="300" fill="#000"/>\n'+
'      <g transform="translate(0,200) skewX({{wind}}) translate(0,-200)">\n'+
'        <rect x="-80" y="20" width="420" height="180" fill="url(#zar2)"/>\n'+
'      </g>\n'+
'    </g>\n'+
'  </g>\n'+
'</svg>'
    }
