---
oj: dmy
pid: '520'
title: '[R81B] 文件同步'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 100$，$S,T$ 的长度均为 $n$，且只包含字符 `0` 和 `1`。

## 思路

同步方向只有两种，分别算出各自需要复制的文件数，取较大者即可。

**从第一个文件夹同步到第二个。** 来源是第一个文件夹，目标中已存在的文件不复制，因此真正需要复制的，恰好是那些在 $S$ 中存在、而在 $T$ 中不存在的编号，即满足 $S_i =$ `1` 且 $T_i =$ `0` 的位置个数，记作 $a$。

**从第二个文件夹同步到第一个。** 同理，需要复制的编号满足 $T_i =$ `1` 且 $S_i =$ `0`，记作 $b$。

答案为 $\max(a,b)$。两位同时存在（`1`/`1`）或同时不存在（`0`/`0`）的编号对两个方向都没有贡献，只需一趟扫描同时累计 $a$ 与 $b$。

## 复杂度

时间 $O(n)$，额外空间 $O(1)$（不计读入的两个字符串）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let t = reader.readln().getOrThrow()
    var a: Int64 = 0
    var b: Int64 = 0
    for (i in 0..n) {
        let sc = Int64(s[i])
        let tc = Int64(t[i])
        if (sc == 49 && tc == 48) {
            a += 1
        }
        if (sc == 48 && tc == 49) {
            b += 1
        }
    }
    if (a > b) {
        println(a)
    } else {
        println(b)
    }
}
```

</details>
