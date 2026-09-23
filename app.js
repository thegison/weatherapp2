const WEATHER_URL='https://api.open-meteo.com/v1/forecast';const GEOCODING_URL='https://geocoding-api.open-meteo.com/v1/search';const STORAGE_KEY='forecasted-user-profile';const defaultPlace={name:'Detroit',admin1:'MI',country:'United States',latitude:42.33,longitude:-83.05};
const weatherCodes={0:['Clear sky','☀','A bright day calls for breathable layers and a little sun protection.'],1:['Mainly clear','🌤','Light layers will keep you comfortable as the day shifts.'],2:['Partly cloudy','⛅','A flexible layer is the move for sun, shade, and everything between.'],3:['Overcast','☁','Keep it polished and layered for a cool, quiet sky.'],45:['Foggy','🌫','Choose visible, textured layers and a warm outer shell.'],48:['Rime fog','🌫','A warm coat and sturdy shoes will make the chill effortless.'],51:['Light drizzle','🌦','Water-resistant layers will keep a little drizzle from changing plans.'],53:['Drizzle','🌦','A light waterproof shell makes this forecast easy.'],55:['Heavy drizzle','🌧','Bring a proper rain layer and shoes that can handle wet streets.'],61:['Light rain','🌧','A light raincoat and closed-toe shoes are your best friends today.'],63:['Rain','🌧','Build your look around a waterproof shell and comfortable layers.'],65:['Heavy rain','🌧','Go practical: waterproof outerwear, sturdy shoes, and a spare layer.'],71:['Light snow','❄','Warm textures and shoes with grip will carry you through the day.'],73:['Snow','❄','Bundle up with insulation, woolly textures, and weatherproof boots.'],75:['Heavy snow','❄','Choose your warmest coat, thick socks, and dependable traction.'],80:['Rain showers','🌦','A packable rain shell gives this forecast room to adapt.'],81:['Rain showers','🌦','Layer for movement and keep a compact umbrella close.'],82:['Heavy showers','🌧','Waterproof outerwear is essential, with shoes made for puddles.'],95:['Thunderstorm','⚡','Stay covered with a weatherproof shell and skip delicate fabrics.'],96:['Storm with hail','⚡','Protective outerwear and sturdy shoes are the practical choice.'],99:['Thunderstorm','⚡','Keep the look simple, covered, and ready for a change of plans.']};
const $=id=>document.getElementById(id);const wetCodes=[51,53,55,61,63,65,80,81,82,95,96,99];

const simpleDatabase={
  readUser(storage=window.localStorage){
    try{
      const raw=storage.getItem(STORAGE_KEY);if(!raw)return{favoriteCity:defaultPlace};const parsed=JSON.parse(raw);return parsed&&parsed.favoriteCity?parsed:{favoriteCity:defaultPlace};
    }catch(error){return{favoriteCity:defaultPlace};}
  },
  writeUser(user,storage=window.localStorage){
    const record={favoriteCity:user.favoriteCity||defaultPlace};storage.setItem(STORAGE_KEY,JSON.stringify(record));return record;
  }
};

function cityName(place){return [place.name,place.admin1||place.country].filter(Boolean).join(', ')}
function setStatus(text=''){ $('status').textContent=text }

function buildWeatherImageSet(temp,code,placeName=''){
  const cold=temp<45,warm=temp>=68,wet=wetCodes.includes(code),summary=weatherCodes[code]||weatherCodes[0];
  const cityLabel=placeName?` in ${placeName}`:'';
  const tone=cold?{base:'linear-gradient(135deg, #dfe8f5 0%, #7b97b6 100%)',tag:'Cool, insulated'}:warm?{base:'linear-gradient(135deg, #f6d9b0 0%, #d88d4a 100%)',tag:'Bright and airy'}:wet?{base:'linear-gradient(135deg, #c9d9df 0%, #537a8e 100%)',tag:'Rain-ready'}:{base:'linear-gradient(135deg, #e6f1de 0%, #7ca26e 100%)',tag:'Fresh and easy'};
  const mainLook = cold ? 'warm knit layers and a structured coat' : warm ? 'lightweight tailoring and breathable fabrics' : wet ? 'waterproof layers and polished outerwear' : 'easy layers with a smart utility finish';
  const imagePool = wet ? [
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  ] : cold ? [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
  ] : warm ? [
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
  ] : [
    'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  ];
  const descriptions = [
    {title:'Weather Hero', description:`A ${summary[0].toLowerCase()} outfit${cityLabel} built around ${mainLook}.`, prompt:`Editorial fashion portrait of ${mainLook} for a ${summary[0].toLowerCase()} day${cityLabel}, soft natural light, clean silhouettes, premium streetwear styling, cozy textures, warm tones, high-end photography`, image:imagePool[0], alt:`Outfit inspiration for ${summary[0].toLowerCase()} weather`},
    {title:'City Ready', description:`Styled for movement and practicality in ${summary[0].toLowerCase()} conditions${cityLabel}.`, prompt:`Modern outfit on a ${summary[0].toLowerCase()} ${cityLabel || 'city'} day, functional layers, confident street style, clean background, relaxed but elevated fashion, natural light, urban photography`, image:imagePool[1], alt:`City-ready outfit for ${summary[0].toLowerCase()} conditions`},
    {title:'Palette Match', description:`Color-forward styling that feels right for the forecast${cityLabel}.`, prompt:`Outfit inspiration for ${summary[0].toLowerCase()} weather${cityLabel}, ${tone.tag.toLowerCase()} palette, layered textures, chic essentials, everyday elegance, polished editorial composition`, image:imagePool[2], alt:`Seasonal color palette outfit for ${summary[0].toLowerCase()} weather`}
  ];
  return descriptions;
}

function renderOutfits(temp,code,place){const outfits=buildWeatherImageSet(temp,code,cityName(place));$('outfit-grid').innerHTML=outfits.map(item=>`<article class="outfit-card"><img class="outfit-image" src="${item.image}" alt="${item.alt}" loading="lazy"><div class="outfit-copy"><h3>${item.title}</h3><p>${item.description}</p><p class="prompt-copy">${item.prompt}</p><div class="tags"><span class="tag">${weatherCodes[code]?.[0]||'Forecast'}</span><span class="tag">${temp < 45 ? 'Warm layers' : temp >= 68 ? 'Light layers' : 'Balanced layers'}</span><span class="tag">${wetCodes.includes(code) ? 'Weather ready' : 'Comfort first'}</span></div></div></article>`).join('')}

async function lookupCity(query){
  const response=await fetch(`${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  const data=await response.json();
  if(!data.results?.length) throw new Error('City not found');
  return data.results[0];
}

async function loadWeather(place){
  setStatus('Pulling in the latest conditions...');
  try{
    const params=new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',temperature_unit:'fahrenheit',wind_speed_unit:'mph',timezone:'auto'});
    const response=await fetch(`${WEATHER_URL}?${params}`);
    if(!response.ok) throw Error();
    const data=await response.json(),current=data.current,detail=weatherCodes[current.weather_code]||weatherCodes[0];
    $('location-name').textContent=cityName(place);
    $('temperature').textContent=Math.round(current.temperature_2m);
    $('feels-like').textContent=`${Math.round(current.apparent_temperature)}°`;
    $('wind').textContent=`${Math.round(current.wind_speed_10m)} mph`;
    $('humidity').textContent=`${current.relative_humidity_2m}%`;
    $('weather-symbol').textContent=detail[1];
    $('condition').textContent=detail[0];
    $('weather-tip').textContent=detail[2];
    $('updated-time').textContent=`Updated ${new Date(current.time).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;
    $('forecast-date').textContent=new Date(`${current.time.split('T')[0]}T12:00:00`).toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
    renderOutfits(current.temperature_2m,current.weather_code,place);
    setStatus('');
  }catch(error){
    setStatus('We could not reach the forecast. Please try again.');
  }
}

async function searchCity(event){
  event.preventDefault();
  const query=$('city-search').value.trim();
  if(!query)return;
  setStatus('Finding that city...');
  try{
    const place=await lookupCity(query);
    $('city-search').value='';
    await loadWeather(place);
  }catch(error){
    setStatus('That city was not found. Try a nearby city or check the spelling.');
  }
}

async function saveFavoriteCity(event){
  event.preventDefault();
  const query=$('favorite-city-input').value.trim();
  if(!query){setStatus('Enter a city name before saving it as your favorite.');return;}
  setStatus('Saving your preferred city...');
  try{
    const place=await lookupCity(query);
    const user=simpleDatabase.writeUser({favoriteCity:place});
    $('favorite-city-input').value=cityName(user.favoriteCity);
    await loadWeather(user.favoriteCity);
    setStatus(`${cityName(user.favoriteCity)} is now saved as your favorite city.`);
  }catch(error){
    setStatus('That city could not be saved. Please check the spelling and try again.');
  }
}

const savedUser=simpleDatabase.readUser();
$('search-form').addEventListener('submit',searchCity);
$('favorite-form').addEventListener('submit',saveFavoriteCity);
$('favorite-city-input').value=savedUser.favoriteCity?cityName(savedUser.favoriteCity):'';
loadWeather(savedUser.favoriteCity || defaultPlace);
