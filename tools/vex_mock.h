// Minimal stand-in for the VEXcode IQ API, so the gym's VEX snippets can be compile-checked.
#include <iostream>
#include <cmath>
#include <string>
#include <fstream>
using std::string; using std::cout; using std::cin; using std::endl; using std::ifstream; using std::ofstream;
enum directionType { forward, reverse };
enum percentUnits { percent };
enum rotationUnits { degrees, turns };
enum distanceUnits { mm, inches };
enum timeUnits { seconds, msec };
enum colorType { red, green, blue, yellow, black, white };
struct motor_t {
  double pos = 0;
  void spin(directionType, double, percentUnits) {}
  void spin(directionType) {}
  void stop() {}
  void setVelocity(double, percentUnits) {}
  void setPosition(double p, rotationUnits) { pos = p; }
  double position(rotationUnits) { return pos += 7; }
};
struct bumper_t { int n = 0; bool pressing() { return (++n % 3) == 0; } };
struct touchled_t { int n = 0; bool pressing() { return (++n % 3) == 0; } };
struct distance_t { double d = 3000; double objectDistance(distanceUnits) { return d -= 10; } };
struct optical_t { int n = 0; colorType color() { return (++n % 50) ? red : green; } double brightness() { return (++n % 100); } };
struct inertial_t { double r = 0; double rotation(rotationUnits) { return r += 1; } void setRotation(double v, rotationUnits) { r = v; } void calibrate() {} };
struct timer_t2 { double t = 0; double time(timeUnits) { return t += 1; } void clear() { t = 0; } };
struct brain_t { timer_t2 Timer; };
struct volume_t { int n = 0; int fill() { return (++n % 4) == 0; } };
struct vision_t { int get_x_mm() { return 300; } int get_y_mm() { return 200; } int piece_angle() { return 90; } };
inline void wait(double, timeUnits) {}
motor_t LeftMotor, RightMotor, washerMotor, juiceMotor, trayMotor, platformMotor, footMotor, sprayMotor, suctionMotor, gripperMotor;
bumper_t Bumper8; touchled_t TouchLED10; distance_t Distance7; optical_t Optical3; inertial_t BrainInertial; brain_t Brain; volume_t Volume; vision_t Vision8;
inline void configureAllSensors() {}
inline void makePrint() {}
inline int buttonValue() { return 2; }
void rotateRobot(int angle, int speed);
void driveDistance(double distance_m);
void driveTime(int sec);
void waitForTap();
void moveFoot(bool toBumper);
void washPass();
void returnToOffice();
