
function awesomeFn() {
  return "awesome";
}

describe("my-awesome-lib", function () {
  it("should return string", function () {
    expect(awesomeFn()).toBe("awesome");
  });

  it("should return string 2", function (done) {
    setTimeout(() => {
      expect(awesomeFn()).toBe("awesome"), 
      done();
    }, 600);
  });
});

afterAll(() => {
  console.log("done!");
});
