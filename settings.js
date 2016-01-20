window.Settings = {
  // @if ENV == 'DEVELOPMENT'
  API_HOST: 'http://localhost:3000'
  // @endif
  // @if ENV == 'PRODUCTION'
  API_HOST: 'https://production.com'
  // @endif
}
