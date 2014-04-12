

set :run, true
set :server, %w[webrick]  

get "/" do
  haml :the_root_of_all_evil
end
