
default_url = "mongodb://localhost:27017/comp-pool"

set :mongodb_uri, {
  :production   => default_url,
  :development  => default_url,
  :test         => default_url  
}