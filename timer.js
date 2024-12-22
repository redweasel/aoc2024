function timed(foo, id) {
    let start = window.performance.now()
    foo();
    let elapsed = window.performance.now() - start;
    document.getElementById(id).innerHTML = `${elapsed}ms`;
}