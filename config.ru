require 'rubygems'
require 'bundler'

Bundler.require

# Require models
Dir["./models/*.rb"].each {|file| require file }

require './sinatrastart.rb'

Signal.trap 'INT' do
    Process.kill 9, Process.pid
end

# Sinatra starts singing here
set :run, true
set :server, %w[webrick]    
set :default_encoding, "utf-8"

get "/" do
  haml :the_root_of_all_evil
end


run Sinatra::Application.run!