from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/israel-gpt")
def israel():
    return render_template("israel-gpt.html")

@app.route("/phonk")
def phonk():
    return render_template("phonk.html")

@app.route("/calc")
def calc():
    return render_template("calc.html")

@app.route("/graphing_calc")
def graphing_calc():
    return render_template("graphing_calc.html")

@app.route("/cm_files")
def cm_files():
    return render_template("cm_files.html")

@app.route("/67")
def sixty_seven():
    return render_template("67.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)