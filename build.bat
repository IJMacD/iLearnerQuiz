@echo off
echo Combining modules
cat gl-matrix.js core.js basic.js camera.js canvasRender.js debug.js webglRender.js > build/ge.js
echo minifying ge.js
java -jar ..\yuicompressor-2.4.7\build\yuicompressor-2.4.7.jar -v -o build/ge.min.js build/ge.js
pause
