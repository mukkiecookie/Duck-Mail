#pragma once
#include <vector>
#include <iostream> 
#include "Letter.h"

class DeliveryScheduler {
private:
    std::vector<Letter> letters;

public:
    void addLetter(Letter letter) {
        letters.push_back(letter);
        std::cout << "[Sent] Letter #" << letter.id << " en route..." << std::endl;
    }

    // call this repeatedly (e.g. in a loop) to check for deliveries
    void checkDeliveries() {
        for (auto &l : letters) {
            if (l.status == Status::InTransit && l.isDue()) {
                l.status = Status::Delivered;
                std::cout << "[Delivered] Letter #" << l.id << ": \"" << l.content << "\"" << std::endl;
            }
        }
    }

    // NEW — lets Python (and anything else) read the letters back
    const std::vector<Letter>& getLetters() const {
        return letters;
    }

    void printAll() const {
        for (const auto &l : letters) l.printInfo();
    }
};