export function CalcularDigitoVerificacion(myNit: string): number {
  const vpri: number[] = Array(16).fill(0);
  let x = 0;
  let y = 0;

  vpri[1] = 3;
  vpri[2] = 7;
  vpri[3] = 13;
  vpri[4] = 17;
  vpri[5] = 19;
  vpri[6] = 23;
  vpri[7] = 29;
  vpri[8] = 37;
  vpri[9] = 41;
  vpri[10] = 43;
  vpri[11] = 47;
  vpri[12] = 53;
  vpri[13] = 59;
  vpri[14] = 67;
  vpri[15] = 71;

  const z = myNit.length;

  for (let i = 0; i < z; i++) {
    y = parseInt(myNit.charAt(i), 10);
    x += y * vpri[z - i];
  }

  y = x % 11;

  return (y > 1) ? 11 - y : y;
}
