import 'package:flutter/material.dart';

class HomePage extends StatefulWidget {
  // This widget is the root of your application.
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Travel Booking')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('Welcome to Travel Booking!'),
            ElevatedButton(
              onPressed: () {
                // Navigate to the booking page
              },
              child: const Text('Book Now'),
            ),
          ],
        ),
      ),
    );
  }
}
