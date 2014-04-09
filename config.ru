require 'rubygems'
require 'bundler'

Bundler.require

# Require models
Dir["./models/*.rb"].each {|file| require file }

require './sinatrastart.rb'

Signal.trap 'INT' do
    Process.kill 9, Process.pid
end

run Sinatra::Application.run!