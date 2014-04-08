require 'rubygems'
require 'bundler'

Bundler.require

# Require models
Dir["./models/*.rb"].each {|file| require file }

require './my_sinatra_app'
run MySinatraApp