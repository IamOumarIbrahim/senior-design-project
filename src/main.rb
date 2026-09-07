# ------------------------------------------------------------------------------
# Main program loop
# ------------------------------------------------------------------------------
class RaspberryPi
  attr_accessor :alarm_working, :camera_working, :weights_available, :model_available

  def initialize 
    @alarm_working = false
    @camera_working = false 
    @weights_available = false
    @model_available = false
  end

  
  # ------------------------------------------------------------------------------
  # Buzzer module 
  # ------------------------------------------------------------------------------
  def buzz_alarm
    # TO BE IMPLEMENTED
  end

  
  # ------------------------------------------------------------------------------
  # Dry-test module 
  # ------------------------------------------------------------------------------
  def dry_test
    if alarm_working == true && camera_working == true && weights_available == true && model_available == true
      puts "System dry-test complete. All systems are working."
    elsif alarm_working == false && camera_working == false && weights_available == false && model_available == false
      puts "System dry-test complete. Neither system is working."
    elsif alarm_working == true && camera_working == false && weights_available == false && model_available == false
      puts "System dry-test complete. Alarm is working, camera is not."
    elsif alarm_working == false && camera_working == true && weights_available == false && model_available == false  
      puts "System dry-test complete. Camera is working, alarm is not."
    elsif alarm_working == true && camera_working == true && weights_available == true && model_available == false
      puts "System dry-test complete. Alarm, camera, and weights are working."
    elsif alarm_working == true && camera_working == true && weights_available == false && model_available == true
      puts "System dry-test complete. Alarm, camera, and model are working."
    elsif alarm_working == true && camera_working == false && weights_available == true && model_available == false
      puts "System dry-test complete. Alarm and weights are working, camera is not."
    elsif alarm_working == true && camera_working == false && weights_available == false && model_available == true
      puts "System dry-test complete. Alarm and model are working, camera is not."
    elsif alarm_working == false && camera_working == true && weights_available == true && model_available == false
      puts "System dry-test complete. Camera and weights are working, alarm is not."
    elsif alarm_working == false && camera_working == true && weights_available == false && model_available == true
      puts "System dry-test complete. Camera and model are working, alarm is not."
    elsif alarm_working == false && camera_working == false && weights_available == true && model_available == false
      puts "System dry-test complete. Weights are working, camera and alarm are not."
    elsif alarm_working == false && camera_working == false && weights_available == false && model_available == true
      puts "System dry-test complete. Model is working, camera and alarm are not."
    end
    puts ""
  end
end


class Terminal
  attr_accessor :board
  alias_method :myboard, :board

  def initialize(board = RaspberryPi.new)
    @board = board
  end

  # ------------------------------------------------------------------------------
  # Camera feed module 
  # ------------------------------------------------------------------------------
  def camera_feed
    puts "Camera feed..."  
    puts "Working? Y/N"
    user_input_camera = gets.chomp
    if user_input_camera == "N" || user_input_camera == "n"
      puts "Camera NOT working"
      puts ""
      board.camera_working = false
    elsif user_input_camera == "Y" || user_input_camera == "y"
      puts "Camera working"
      puts ""
      board.camera_working = true
    else
      puts "Invalid input. Exiting..."
      puts ""
      exit
    end
  end

  # ------------------------------------------------------------------------------
  # Alarm system module
  # ------------------------------------------------------------------------------

  def alarm_system
    puts "Buzzing..."
    board.buzz_alarm
    puts "Working? Y/N"
    user_input_alarm = gets.chomp
    if user_input_alarm == "N" || user_input_alarm == "n"
      puts "Alarm NOT working"
      puts ""
      board.alarm_working = false
    elsif user_input_alarm == "Y" || user_input_alarm == "y"
      puts "Alarm working"
      puts ""
      board.alarm_working = true
    else
      puts "Invalid input. Exiting..."
      puts ""
      exit
    end
  end

  # ------------------------------------------------------------------------------
  # Starting Screen Module 
  # ------------------------------------------------------------------------------

  def starting_screen
    loop do
      puts "_" * 60
      puts "Welcome to the Driver Monitoring System"
      puts "_" * 60

      puts "Start the live RGB camera feed:   [1]"
      puts "Start the alarm system:           [2]"
      puts "Run a system dry-test:            [3]"
      puts "Exit program:                     [4]"
      puts "_" * 60

      user_choice = gets.chomp

      while user_choice != "1" && user_choice != "2" && user_choice != "3" && user_choice != "4"
        puts "Invalid choice. Please try again."
        user_choice = gets.chomp
      end

      case user_choice
      when "1"
        puts "Starting camera feed..."  
        puts "_" * 60
        camera_feed
      when "2"
        puts "Starting alarm system..."  
        puts "_" * 60
        alarm_system
      when "3"
        puts "Running system dry-test..."  
        puts "_" * 60
        board.dry_test
      when "4"
        puts "Exiting program..."  
        puts "_" * 60
        exit
      end
    end
  end
end

# ------------------------------------------------------------------------------
# Call the starting screen
# ------------------------------------------------------------------------------
# 
myboard = RaspberryPi.new
mysession = Terminal.new(myboard)
mysession.starting_screen
