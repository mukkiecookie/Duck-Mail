#pragma once
#include <cstdlib>
#include <string> 

class TrafficService {
public:
    int getTravelTimeSeconds(const std::string &from, const std::string &to) {
        // placeholder: random delay between 5-20 seconds so you can watch it work
        return 5 + (rand() % 16);
    }
};