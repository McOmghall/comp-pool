
# Make rack killable with a SIGINT
Signal.trap 'INT' do
    Process.kill 9, Process.pid
end