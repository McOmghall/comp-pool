# Require models, configuration files and gems
require 'rubygems'
require 'bundler'
Bundler.require
Dir["./models/*.rb", "./config/*.rb"].each {|file| require file }

#######################################################################
# Sinatra starts singing here
# To run different environments, set the RACK_ENV environment variable:
# RACK_ENV=production ruby my_app.rb
#######################################################################

configure do
  set :run, true
  set :server, %w[webrick]    
  set :default_encoding, "utf-8"
  set :haml, {
      :format => :html5
  }
  
  # MongoMapper defaults, config from ./config/mongodb-config.rb
  MongoMapper.setup({
    :production   => {:uri => settings.mongodb_uri[:production]},
    :development  => {:uri => settings.mongodb_uri[:development]},
    :test         => {:uri => settings.mongodb_uri[:test]}
  }, settings.environment)
  
  puts "Logged in (#{settings.environment}) to #{MongoMapper.connection.db}"
end


#######################################################################
# Routes
#######################################################################

get "/" do
  haml :the_root_of_all_evil
end

after do
  Request.first_or_create(:user_ip => request.ip || "")
    .user_agents.first_or_create(:user_agent => request.user_agent || "")
      .request_urls.create(:request_url => "/")
end


run Sinatra::Application.run!