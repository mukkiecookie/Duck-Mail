#pragma once
#include <string>
#include <chrono>
#include <iostream>

enum class Status { InTransit, Delivered };

class Letter {
public:
    int id;
    std::string senderId, receiverId, content;
    std::chrono::system_clock::time_point sentAt;
    std::chrono::system_clock::time_point deliverAt;
    Status status;

    Letter(int id, std::string sender, std::string receiver, std::string content, int delaySeconds)
        : id(id), senderId(sender), receiverId(receiver), content(content), status(Status::InTransit)
    {
        sentAt = std::chrono::system_clock::now();
        deliverAt = sentAt + std::chrono::seconds(delaySeconds);
    }

    bool isDue() const {
        return std::chrono::system_clock::now() >= deliverAt;
    }

    void printInfo() const {
        std::cout << "Letter #" << id << " from " << senderId << " to " << receiverId
                   << ": \"" << content << "\" - "
                   << (status == Status::Delivered ? "Delivered" : "In Transit") << std::endl;
    }
};