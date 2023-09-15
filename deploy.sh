rm -rf build/contracts
rm -rf frontend/src/contracts
truffle migrate --reset --network development
mv  build/contracts frontend/src/ 
