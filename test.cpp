#include <string>
#include <iostream>
class Circle{
private:
    double radius;
    std::string color;
public:
    Circle(double m_radius=1.0):radius{m_radius},color{"red"}{
    }
    double getRadius(){
        return radius;
    }
    double getArea(){
        return 3.14*radius*radius;
    }
};
int main(){
    Circle m_circle{};
    std::cout<<m_circle.getRadius();
}