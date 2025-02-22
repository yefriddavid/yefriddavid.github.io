import { of } from 'rxjs';
import { map } from 'rxjs/operators';


//import { describe, expect, it } from "vitest";

//describe('Función Suma', async () => {

const t = map( year => `table-${year}` )

async function test(year){
  //const observable$ = of(year).pipe(
  //  map(year => 'table-' + year)
  //);

  // const resultado = await observable$.toPromise();


  const resultado = await of(year).pipe(t).toPromise()

  console.log(resultado);
}

test(2015)

  //const data$ = of({year: "2015"});

  /*data$.pipe(
      map(data => `Welcome ${data.firstName}`)
  ).subscribe(console.log); // Output: Welcome Jane
  */
//expect("david").toBe("david");

//});

