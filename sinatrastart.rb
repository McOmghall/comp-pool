set :run, true
set :server, %w[webrick]    
set :default_encoding, "utf-8"

get "/" do
  haml :the_root_of_all_evil
end
