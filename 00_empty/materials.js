
/**
* This file contains different materials. These are all based on empirical tests.
**/
var lightWoodMaterial = new Material([.227,.1137,.0392,1],
                                [0.43,0.223,0.0863,1],
                                [0, 0, 0, 1],
                                [0, 0, 0, 1],
                                0);

var darkWoodMaterial = new Material([.227,.1137,.0392,1],
                                [.227,.1137,.0392,1],
                                [0, 0, 0, 1],
                                [0, 0, 0, 1],
                                0);

var goldMaterial = new Material([0.24725, 0.1995, 0.0745, 1],
                                [0.75164, 0.60648, 0.22648, 1],
                                [0.628281, 0.555802, 0.366065, 1],
                                [0, 0, 0, 1],
                                40);

var stoneMaterial = new Material([0.3, 0.3, 0.3, 1],
                                [0.7, 0.7, 0.7, 1],
                                [0, 0, 0, 1],
                                [0, 0, 0, 1],
                                0);

var snowMaterial = new Material([1, 1, 1, 1],
								[1, 1, 1, 1],
								[0, 0, 0, 1],
								[0.2, 0.2, 0.2, 1],
								0);

var metalMaterial = new Material([0.1, 0.1, 0.1, 1.0],
								[0.3, 0.3, 0.3, 1],
								[1, 1, 1, 1],
								[0, 0, 0, 1],
								100);

var glassMaterial = new Material([0, 0, 0, 0],
								[0.9, 0.9, 0.9, 0.1],
								[0.9, 0.9, 0.9, 0.1],
								[0, 0, 0, 0],
								40);
