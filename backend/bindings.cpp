#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "Letter.h"
#include "TrafficService.h"
#include "DeliveryScheduler.h"

namespace py = pybind11;

PYBIND11_MODULE(letter_engine, m) {
    m.doc() = "C++ letter delivery engine";

    py::enum_<Status>(m, "Status")
        .value("InTransit", Status::InTransit)
        .value("Delivered", Status::Delivered);

    py::class_<Letter>(m, "Letter")
    .def(py::init<int, std::string, std::string, std::string, int>())
    .def_readonly("id", &Letter::id)
    .def_readonly("sender_id", &Letter::senderId)
    .def_readonly("receiver_id", &Letter::receiverId)
    .def_readonly("content", &Letter::content)
    .def_readonly("status", &Letter::status)
    .def("is_due", &Letter::isDue)
    .def("__repr__", [](const Letter &l) {
        return "<Letter #" + std::to_string(l.id) + ": " + l.senderId + " -> " + l.receiverId +
               " \"" + l.content + "\" (" + (l.status == Status::Delivered ? "Delivered" : "In Transit") + ")>";
    });

    py::class_<TrafficService>(m, "TrafficService")
        .def(py::init<>())
        .def("get_travel_time_seconds", &TrafficService::getTravelTimeSeconds);

    py::class_<DeliveryScheduler>(m, "DeliveryScheduler")
        .def(py::init<>())
        .def("add_letter", &DeliveryScheduler::addLetter)
        .def("check_deliveries", &DeliveryScheduler::checkDeliveries)
        .def("get_letters", &DeliveryScheduler::getLetters);
}