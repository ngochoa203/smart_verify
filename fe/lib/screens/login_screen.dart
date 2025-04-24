import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = true;
  bool _loading = false;

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    final uri = Uri.parse(
      'https://your-api-url.com/login',
    ); // Replace with your real API
    try {
      final response = await http.post(
        uri,
        body: {
          'user_name': _usernameController.text,
          'password': _passwordController.text,
        },
      );

      if (response.statusCode == 200) {
        final userData = json.decode(response.body);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Đăng nhập thành công!')));

        switch (userData['role']) {
          case 'admin':
            Navigator.pushReplacementNamed(context, '/admin');
            break;
          case 'tourist':
            Navigator.pushReplacementNamed(context, '/');
            break;
          case 'business':
            Navigator.pushReplacementNamed(context, '/business');
            break;
          default:
            Navigator.pushReplacementNamed(context, '/');
        }
      } else {
        throw Exception('Invalid credentials');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.',
          ),
        ),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Center(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.75),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Đăng nhập',
                      style: TextStyle(
                        fontSize: 28,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _usernameController,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.person),
                        hintText: 'Tên đăng nhập',
                      ),
                      validator:
                          (value) =>
                              value == null || value.isEmpty
                                  ? 'Vui lòng nhập tên đăng nhập!'
                                  : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.lock),
                        hintText: 'Mật khẩu',
                      ),
                      validator:
                          (value) =>
                              value == null || value.isEmpty
                                  ? 'Vui lòng nhập mật khẩu!'
                                  : null,
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged:
                              (val) => setState(() => _rememberMe = val!),
                        ),
                        const Text(
                          'Nhớ đăng nhập',
                          style: TextStyle(color: Colors.white),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed:
                              () => Navigator.pushNamed(
                                context,
                                '/forgot-password',
                              ),
                          child: const Text('Quên mật khẩu'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: _loading ? null : _login,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        minimumSize: const Size.fromHeight(48),
                      ),
                      child:
                          _loading
                              ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                              : const Text('Đăng nhập'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pushNamed(context, '/regis'),
                      child: const Text('Đăng ký ngay'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
